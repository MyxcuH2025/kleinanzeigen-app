"""
Analytics Service für Business Intelligence
"""
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlmodel import Session, select, func, and_, or_
from models.analytics import (
    AnalyticsEvent, RevenueMetric, 
    ABTest, EventType, UserAnalytics
)
from models.payment import Payment, PaymentStatus, PaymentMethod
from models.user import User
from models.listing import Listing
import json
import redis
from config import Config

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service für Analytics und Business Intelligence"""
    
    def __init__(self, session: Session):
        self.session = session
        # Redis-Caching für bessere Performance
        try:
            self.redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
            self.redis_client.ping()
            logger.info("✅ Redis-Caching aktiviert")
        except Exception as e:
            logger.warning(f"Redis-Caching deaktiviert: {e}")
            self.redis_client = None
    
    # ==================== CACHING ====================
    
    def _get_cache(self, key: str) -> Optional[Any]:
        """Holt Daten aus Redis-Cache"""
        if not self.redis_client:
            return None
        try:
            cached_data = self.redis_client.get(key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Cache-Fehler: {e}")
        return None
    
    def _set_cache(self, key: str, data: Any, ttl: int = 300) -> None:
        """Speichert Daten im Redis-Cache"""
        if not self.redis_client:
            return
        try:
            self.redis_client.setex(key, ttl, json.dumps(data, default=str))
        except Exception as e:
            logger.warning(f"Cache-Fehler: {e}")
    
    # ==================== EVENT TRACKING ====================
    
    def track_event(
        self, 
        event_type: EventType, 
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
        value: Optional[float] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        referrer: Optional[str] = None
    ) -> AnalyticsEvent:
        """Tracke ein Analytics Event"""
        try:
            event = AnalyticsEvent(
                event_type=event_type,
                user_id=user_id,
                session_id=session_id,
                properties=properties or {},
                value=value,
                ip_address=ip_address,
                user_agent=user_agent,
                referrer=referrer
            )
            
            self.session.add(event)
            self.session.commit()
            self.session.refresh(event)
            
            logger.info(f"Event tracked: {event_type} for user {user_id}")
            return event
            
        except Exception as e:
            logger.error(f"Failed to track event {event_type}: {e}")
            self.session.rollback()
            raise
    
    def get_events(
        self,
        event_types: Optional[List[EventType]] = None,
        user_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 1000
    ) -> List[AnalyticsEvent]:
        """Hole Events mit Filtern"""
        query = select(AnalyticsEvent)
        
        if event_types:
            query = query.where(AnalyticsEvent.event_type.in_(event_types))
        if user_id:
            query = query.where(AnalyticsEvent.user_id == user_id)
        if start_date:
            query = query.where(AnalyticsEvent.event_date >= start_date)
        if end_date:
            query = query.where(AnalyticsEvent.event_date <= end_date)
        
        query = query.order_by(AnalyticsEvent.created_at.desc()).limit(limit)
        
        return self.session.exec(query).all()
    
    # ==================== REVENUE ANALYTICS ====================
    
    def calculate_daily_revenue(self, target_date: date) -> RevenueMetric:
        """Berechne Tagesumsatz"""
        try:
            # Hole alle Payments für den Tag
            payments = self.session.exec(
                select(Payment).where(
                    and_(
                        func.date(Payment.created_at) == target_date,
                        Payment.status == PaymentStatus.COMPLETED
                    )
                )
            ).all()
            
            # Berechne Metriken
            total_revenue = sum(p.amount for p in payments)
            payment_count = len(payments)
            
            subscription_revenue = sum(
                p.amount for p in payments 
                if p.transaction_type == "subscription"
            )
            one_time_revenue = total_revenue - subscription_revenue
            
            stripe_revenue = sum(
                p.amount for p in payments 
                if p.method == PaymentMethod.STRIPE
            )
            paypal_revenue = sum(
                p.amount for p in payments 
                if p.method == PaymentMethod.PAYPAL
            )
            
            # Hole User-Metriken
            new_users = self.session.exec(
                select(func.count(User.id)).where(
                    func.date(User.created_at) == target_date
                )
            ).first() or 0
            
            active_users = self.session.exec(
                select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                    and_(
                        AnalyticsEvent.event_date == target_date,
                        AnalyticsEvent.user_id.isnot(None)
                    )
                )
            ).first() or 0
            
            paying_users = len(set(p.user_id for p in payments))
            
            # Erstelle oder aktualisiere RevenueMetric
            existing_metric = self.session.exec(
                select(RevenueMetric).where(RevenueMetric.date == target_date)
            ).first()
            
            if existing_metric:
                existing_metric.total_revenue = total_revenue
                existing_metric.payment_count = payment_count
                existing_metric.subscription_revenue = subscription_revenue
                existing_metric.one_time_revenue = one_time_revenue
                existing_metric.stripe_revenue = stripe_revenue
                existing_metric.paypal_revenue = paypal_revenue
                existing_metric.new_users = new_users
                existing_metric.active_users = active_users
                existing_metric.paying_users = paying_users
                existing_metric.updated_at = datetime.utcnow()
                
                self.session.add(existing_metric)
                self.session.commit()
                return existing_metric
            else:
                metric = RevenueMetric(
                    date=target_date,
                    total_revenue=total_revenue,
                    payment_count=payment_count,
                    subscription_revenue=subscription_revenue,
                    one_time_revenue=one_time_revenue,
                    stripe_revenue=stripe_revenue,
                    paypal_revenue=paypal_revenue,
                    new_users=new_users,
                    active_users=active_users,
                    paying_users=paying_users
                )
                
                self.session.add(metric)
                self.session.commit()
                self.session.refresh(metric)
                return metric
                
        except Exception as e:
            logger.error(f"Failed to calculate daily revenue for {target_date}: {e}")
            self.session.rollback()
            raise
    
    def get_revenue_metrics(
        self,
        start_date: date,
        end_date: date
    ) -> List[RevenueMetric]:
        """Hole Revenue-Metriken für Zeitraum"""
        return self.session.exec(
            select(RevenueMetric).where(
                and_(
                    RevenueMetric.date >= start_date,
                    RevenueMetric.date <= end_date
                )
            ).order_by(RevenueMetric.date)
        ).all()
    
    def get_revenue_summary(self, days: int = 30) -> Dict[str, Any]:
        """Hole Revenue-Zusammenfassung"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        metrics = self.get_revenue_metrics(start_date, end_date)
        
        if not metrics:
            return {
                "total_revenue": 0,
                "total_payments": 0,
                "average_daily_revenue": 0,
                "growth_rate": 0,
                "top_payment_method": "N/A"
            }
        
        total_revenue = sum(m.total_revenue for m in metrics)
        total_payments = sum(m.payment_count for m in metrics)
        average_daily_revenue = total_revenue / len(metrics) if metrics else 0
        
        # Wachstumsrate berechnen
        if len(metrics) >= 2:
            first_half = metrics[:len(metrics)//2]
            second_half = metrics[len(metrics)//2:]
            
            first_half_revenue = sum(m.total_revenue for m in first_half)
            second_half_revenue = sum(m.total_revenue for m in second_half)
            
            if first_half_revenue > 0:
                growth_rate = ((second_half_revenue - first_half_revenue) / first_half_revenue) * 100
            else:
                growth_rate = 0
        else:
            growth_rate = 0
        
        # Top Payment Method
        stripe_total = sum(m.stripe_revenue for m in metrics)
        paypal_total = sum(m.paypal_revenue for m in metrics)
        
        if stripe_total > paypal_total:
            top_method = "Stripe"
        elif paypal_total > stripe_total:
            top_method = "PayPal"
        else:
            top_method = "Equal"
        
        return {
            "total_revenue": total_revenue,
            "total_payments": total_payments,
            "average_daily_revenue": average_daily_revenue,
            "growth_rate": growth_rate,
            "top_payment_method": top_method,
            "stripe_revenue": stripe_total,
            "paypal_revenue": paypal_total
        }
    
    # ==================== USER ANALYTICS ====================
    
    def update_user_analytics(self, user_id: int) -> UserAnalytics:
        """Aktualisiere User Analytics"""
        try:
            # Hole bestehende Analytics oder erstelle neue
            analytics = self.session.exec(
                select(UserAnalytics).where(UserAnalytics.user_id == user_id)
            ).first()
            
            if not analytics:
                analytics = UserAnalytics(user_id=user_id)
                self.session.add(analytics)
            
            # Hole User-Events
            events = self.get_events(user_id=user_id)
            
            # Berechne Metriken
            analytics.total_page_views = len([e for e in events if e.event_type == EventType.PAGE_VIEW])
            analytics.total_searches = len([e for e in events if e.event_type == EventType.SEARCH_PERFORMED])
            analytics.total_listings_created = len([e for e in events if e.event_type == EventType.LISTING_CREATED])
            analytics.total_listings_viewed = len([e for e in events if e.event_type == EventType.LISTING_VIEWED])
            analytics.total_chat_messages = len([e for e in events if e.event_type == EventType.CHAT_MESSAGE])
            analytics.total_favorites = len([e for e in events if e.event_type == EventType.FAVORITE_ADDED])
            
            # Zeit-Metriken
            if events:
                analytics.first_activity = min(e.created_at for e in events)
                analytics.last_activity = max(e.created_at for e in events)
                
                # Session-Zeit berechnen (vereinfacht)
                analytics.total_session_time = len(events) * 300  # 5 Min pro Event
            
            # Conversion Rate
            payments = self.session.exec(
                select(Payment).where(
                    and_(
                        Payment.user_id == user_id,
                        Payment.status == PaymentStatus.COMPLETED
                    )
                )
            ).all()
            
            if analytics.total_page_views > 0:
                analytics.conversion_rate = (len(payments) / analytics.total_page_views) * 100
            
            # Lifetime Value
            analytics.lifetime_value = sum(p.amount for p in payments)
            
            # Device/Browser (vereinfacht)
            if events and events[0].user_agent:
                user_agent = events[0].user_agent.lower()
                if 'mobile' in user_agent:
                    analytics.primary_device = 'mobile'
                elif 'tablet' in user_agent:
                    analytics.primary_device = 'tablet'
                else:
                    analytics.primary_device = 'desktop'
                
                if 'chrome' in user_agent:
                    analytics.primary_browser = 'chrome'
                elif 'firefox' in user_agent:
                    analytics.primary_browser = 'firefox'
                elif 'safari' in user_agent:
                    analytics.primary_browser = 'safari'
                else:
                    analytics.primary_browser = 'other'
            
            analytics.updated_at = datetime.utcnow()
            
            self.session.add(analytics)
            self.session.commit()
            self.session.refresh(analytics)
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to update user analytics for user {user_id}: {e}")
            self.session.rollback()
            raise
    
    def get_user_analytics(self, user_id: int) -> Optional[UserAnalytics]:
        """Hole User Analytics"""
        return self.session.exec(
            select(UserAnalytics).where(UserAnalytics.user_id == user_id)
        ).first()
    
    def get_top_users(self, limit: int = 10) -> List[UserAnalytics]:
        """Hole Top User nach Engagement"""
        return self.session.exec(
            select(UserAnalytics)
            .order_by(UserAnalytics.total_page_views.desc())
            .limit(limit)
        ).all()
    
    # ==================== A/B TESTING ====================
    
    def create_ab_test(
        self,
        name: str,
        description: str,
        variants: Dict[str, Any],
        traffic_allocation: Dict[str, float],
        primary_metric: str,
        secondary_metrics: Optional[List[str]] = None
    ) -> ABTest:
        """Erstelle A/B Test"""
        try:
            ab_test = ABTest(
                name=name,
                description=description,
                variants=variants,
                traffic_allocation=traffic_allocation,
                primary_metric=primary_metric,
                secondary_metrics=secondary_metrics or []
            )
            
            self.session.add(ab_test)
            self.session.commit()
            self.session.refresh(ab_test)
            
            logger.info(f"A/B Test created: {name}")
            return ab_test
            
        except Exception as e:
            logger.error(f"Failed to create A/B test {name}: {e}")
            self.session.rollback()
            raise
    
    def assign_user_to_test(self, user_id: int, test_id: str) -> str:
        """Weise User einem Test-Variant zu"""
        try:
            # Prüfe ob User bereits zugewiesen
            existing = self.session.exec(
                select(ABTestAssignment).where(
                    and_(
                        ABTestAssignment.user_id == user_id,
                        ABTestAssignment.test_id == test_id
                    )
                )
            ).first()
            
            if existing:
                return existing.variant
            
            # Hole Test
            test = self.session.exec(
                select(ABTest).where(ABTest.test_id == test_id)
            ).first()
            
            if not test or test.status != "running":
                raise ValueError("Test not found or not running")
            
            # Bestimme Variant basierend auf Traffic Allocation
            import random
            random.seed(user_id)  # Konsistente Zuweisung
            rand = random.random()
            
            cumulative = 0
            for variant, allocation in test.traffic_allocation.items():
                cumulative += allocation
                if rand <= cumulative:
                    assignment = ABTestAssignment(
                        user_id=user_id,
                        test_id=test_id,
                        variant=variant
                    )
                    
                    self.session.add(assignment)
                    self.session.commit()
                    
                    return variant
            
            # Fallback
            variant = list(test.traffic_allocation.keys())[0]
            assignment = ABTestAssignment(
                user_id=user_id,
                test_id=test_id,
                variant=variant
            )
            
            self.session.add(assignment)
            self.session.commit()
            
            return variant
            
        except Exception as e:
            logger.error(f"Failed to assign user {user_id} to test {test_id}: {e}")
            self.session.rollback()
            raise
    
    def get_test_results(self, test_id: str) -> Dict[str, Any]:
        """Hole A/B Test Ergebnisse"""
        try:
            test = self.session.exec(
                select(ABTest).where(ABTest.test_id == test_id)
            ).first()
            
            if not test:
                raise ValueError("Test not found")
            
            # Hole Assignments
            assignments = self.session.exec(
                select(ABTestAssignment).where(ABTestAssignment.test_id == test_id)
            ).all()
            
            # Gruppiere nach Variants
            variant_stats = {}
            for variant in test.variants.keys():
                variant_assignments = [a for a in assignments if a.variant == variant]
                
                variant_stats[variant] = {
                    "total_users": len(variant_assignments),
                    "converted_users": len([a for a in variant_assignments if a.converted]),
                    "conversion_rate": 0,
                    "total_value": sum(a.conversion_value or 0 for a in variant_assignments)
                }
                
                if variant_stats[variant]["total_users"] > 0:
                    variant_stats[variant]["conversion_rate"] = (
                        variant_stats[variant]["converted_users"] / 
                        variant_stats[variant]["total_users"]
                    ) * 100
            
            # Bestimme Winner
            winner = max(
                variant_stats.keys(),
                key=lambda v: variant_stats[v]["conversion_rate"]
            )
            
            # Speichere Ergebnisse
            test.results = variant_stats
            test.winner = winner
            test.updated_at = datetime.utcnow()
            
            self.session.add(test)
            self.session.commit()
            
            return {
                "test_id": test_id,
                "test_name": test.name,
                "status": test.status,
                "variants": variant_stats,
                "winner": winner,
                "confidence_level": 95.0  # Vereinfacht
            }
            
        except Exception as e:
            logger.error(f"Failed to get test results for {test_id}: {e}")
            self.session.rollback()
            raise
