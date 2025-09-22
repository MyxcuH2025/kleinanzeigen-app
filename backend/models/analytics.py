"""
Analytics Models für Business Intelligence
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON, Text, Index
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

class EventType(str, Enum):
    """Analytics Event Types"""
    PAGE_VIEW = "page_view"
    USER_REGISTRATION = "user_registration"
    LISTING_CREATED = "listing_created"
    LISTING_VIEWED = "listing_viewed"
    SEARCH_PERFORMED = "search_performed"
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_COMPLETED = "payment_completed"
    SUBSCRIPTION_CREATED = "subscription_created"
    CHAT_MESSAGE = "chat_message"
    FAVORITE_ADDED = "favorite_added"
    REPORT_SUBMITTED = "report_submitted"

class MetricType(str, Enum):
    """Metric Types"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

class AnalyticsEvent(SQLModel, table=True):
    """Analytics Event Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Event Details
    event_type: EventType = Field(index=True)
    user_id: Optional[int] = Field(default=None, index=True)
    session_id: Optional[str] = Field(default=None, index=True)
    
    # Event Data
    properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    value: Optional[float] = Field(default=None, description="Numeric value for metrics")
    
    # Context
    ip_address: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None, sa_column=Column(Text))
    referrer: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    event_date: date = Field(default_factory=date.today, index=True)

class RevenueMetric(SQLModel, table=True):
    """Revenue Metrics Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Time Period
    metric_date: date = Field(index=True, description="Date for the metric")
    hour: Optional[int] = Field(default=None, index=True)
    
    # Revenue Data
    total_revenue: float = Field(default=0.0, description="Total revenue in cents")
    payment_count: int = Field(default=0)
    subscription_revenue: float = Field(default=0.0)
    one_time_revenue: float = Field(default=0.0)
    
    # Payment Methods
    stripe_revenue: float = Field(default=0.0)
    paypal_revenue: float = Field(default=0.0)
    
    # User Metrics
    new_users: int = Field(default=0)
    active_users: int = Field(default=0)
    paying_users: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserAnalytics(SQLModel, table=True):
    """User Analytics Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Engagement Metrics
    total_page_views: int = Field(default=0)
    total_searches: int = Field(default=0)
    total_listings_created: int = Field(default=0)
    total_listings_viewed: int = Field(default=0)
    total_chat_messages: int = Field(default=0)
    total_favorites: int = Field(default=0)
    
    # Time Metrics
    first_activity: Optional[datetime] = Field(default=None)
    last_activity: Optional[datetime] = Field(default=None)
    total_session_time: int = Field(default=0, description="Total session time in seconds")
    
    # Conversion Metrics
    conversion_rate: float = Field(default=0.0, description="Conversion rate to paying user")
    lifetime_value: float = Field(default=0.0, description="Customer lifetime value in cents")
    
    # Device/Platform
    primary_device: Optional[str] = Field(default=None)
    primary_browser: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ABTest(SQLModel, table=True):
    """A/B Test Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    test_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Test Details
    name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    status: str = Field(default="draft", index=True)  # draft, running, completed, paused
    
    # Test Configuration
    variants: Dict[str, Any] = Field(sa_column=Column(JSON), description="Test variants configuration")
    traffic_allocation: Dict[str, float] = Field(sa_column=Column(JSON), description="Traffic allocation per variant")
    
    # Metrics
    primary_metric: str = Field(description="Primary success metric")
    secondary_metrics: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Time Period
    start_date: Optional[datetime] = Field(default=None)
    end_date: Optional[datetime] = Field(default=None)
    
    # Results
    results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    winner: Optional[str] = Field(default=None)
    confidence_level: Optional[float] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ABTestAssignment(SQLModel, table=True):
    """A/B Test User Assignment"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    test_id: str = Field(foreign_key="abtest.test_id", index=True)
    variant: str = Field(index=True)
    
    # Assignment Details
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    converted: bool = Field(default=False)
    conversion_value: Optional[float] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardWidget(SQLModel, table=True):
    """Dashboard Widget Configuration"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    widget_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Widget Details
    name: str = Field(index=True)
    widget_type: str = Field(index=True)  # chart, metric, table, map
    title: str = Field()
    description: Optional[str] = Field(default=None)
    
    # Configuration
    config: Dict[str, Any] = Field(sa_column=Column(JSON), description="Widget configuration")
    data_source: str = Field(description="Data source query or endpoint")
    
    # Display
    position_x: int = Field(default=0)
    position_y: int = Field(default=0)
    width: int = Field(default=4)
    height: int = Field(default=3)
    
    # Access Control
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    is_public: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Indexes für Performance
__table_args__ = (
    Index('idx_analytics_event_type_date', 'event_type', 'event_date'),
    Index('idx_analytics_user_date', 'user_id', 'event_date'),
    Index('idx_revenue_date_hour', 'date', 'hour'),
    Index('idx_user_analytics_activity', 'last_activity'),
    Index('idx_abtest_status', 'status'),
    Index('idx_abtest_assignment_user', 'user_id', 'test_id'),
)
