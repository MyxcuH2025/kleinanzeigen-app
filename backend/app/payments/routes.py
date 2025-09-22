"""
Payment Routes für Monetarisierung
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Query
from sqlmodel import Session, select
from models.payment import (
    Payment, PaymentCreate, PaymentUpdate, PaymentResponse,
    Subscription, SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse,
    Invoice, InvoiceCreate, InvoiceResponse,
    PaymentStatus, PaymentMethod, SubscriptionPlan
)
from app.dependencies import get_session, get_current_user
from app.security.input_validation import SecurityValidator
from app.security.xss_protection import XSSProtection
from app.payments.stripe_service import StripeService
from app.payments.paypal_service import PayPalService
from config import config
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# Router für Payment-Endpoints
router = APIRouter(prefix="/api/payments", tags=["payments"])

# Logging
logger = logging.getLogger(__name__)

# Payment Services initialisieren
stripe_service = StripeService(
    api_key=config.STRIPE_SECRET_KEY,
    webhook_secret=config.STRIPE_WEBHOOK_SECRET
)

paypal_service = PayPalService(
    client_id=config.PAYPAL_CLIENT_ID,
    client_secret=config.PAYPAL_CLIENT_SECRET,
    sandbox=config.PAYPAL_SANDBOX
)

@router.post("/create", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Erstelle neue Zahlung"""
    
    try:
        # Input-Validierung
        validated_data = SecurityValidator.validate_json_input(
            payment_data.dict(), "payment_data"
        )
        
        # Payment in Datenbank speichern
        payment = Payment(
            user_id=current_user.id,
            amount=validated_data["amount"],
            currency=validated_data["currency"],
            payment_method=validated_data["payment_method"],
            description=validated_data.get("description"),
            metadata=validated_data.get("metadata"),
            status=PaymentStatus.PENDING
        )
        
        session.add(payment)
        session.commit()
        session.refresh(payment)
        
        # Payment Gateway-spezifische Logik
        if payment_data.payment_method == PaymentMethod.STRIPE:
            # Stripe Payment Intent erstellen
            stripe_response = await stripe_service.create_payment_intent(
                amount=payment_data.amount,
                currency=payment_data.currency,
                description=payment_data.description,
                metadata={"payment_id": payment.payment_id}
            )
            
            # Gateway-Informationen speichern
            payment.gateway_payment_id = stripe_response["payment_intent_id"]
            payment.status = PaymentStatus.PROCESSING
            
        elif payment_data.payment_method == PaymentMethod.PAYPAL:
            # PayPal Payment erstellen
            paypal_response = await paypal_service.create_payment(
                amount=payment_data.amount,
                currency=payment_data.currency,
                description=payment_data.description
            )
            
            # Gateway-Informationen speichern
            payment.gateway_payment_id = paypal_response["payment_id"]
            payment.status = PaymentStatus.PROCESSING
        
        session.commit()
        
        # Sichere Response erstellen
        response_data = XSSProtection.create_safe_response({
            "payment_id": payment.payment_id,
            "status": payment.status,
            "amount": payment.amount,
            "currency": payment.currency,
            "payment_method": payment.payment_method,
            "gateway_payment_id": payment.gateway_payment_id,
            "created_at": payment.created_at,
            "expires_at": payment.expires_at
        }, "Payment erfolgreich erstellt")
        
        return PaymentResponse(**response_data["data"])
        
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Payment creation failed"
        )

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Hole Payment-Details"""
    
    try:
        # Input-Validierung
        payment_id = SecurityValidator.validate_string_input(payment_id, "payment_id", 100)
        
        # Payment aus Datenbank holen
        statement = select(Payment).where(
            Payment.payment_id == payment_id,
            Payment.user_id == current_user.id
        )
        payment = session.exec(statement).first()
        
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment not found"
            )
        
        # Sichere Response erstellen
        response_data = XSSProtection.create_safe_response({
            "payment_id": payment.payment_id,
            "status": payment.status,
            "amount": payment.amount,
            "currency": payment.currency,
            "payment_method": payment.payment_method,
            "gateway_payment_id": payment.gateway_payment_id,
            "created_at": payment.created_at,
            "expires_at": payment.expires_at
        }, "Payment details retrieved")
        
        return PaymentResponse(**response_data["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment retrieval error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Payment retrieval failed"
        )

@router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Bestätige Payment"""
    
    try:
        # Input-Validierung
        payment_id = SecurityValidator.validate_string_input(payment_id, "payment_id", 100)
        
        # Payment aus Datenbank holen
        statement = select(Payment).where(
            Payment.payment_id == payment_id,
            Payment.user_id == current_user.id
        )
        payment = session.exec(statement).first()
        
        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment not found"
            )
        
        # Payment Gateway-spezifische Bestätigung
        if payment.payment_method == PaymentMethod.STRIPE:
            # Stripe Payment Intent bestätigen
            stripe_response = await stripe_service.get_payment_intent(
                payment.gateway_payment_id
            )
            
            if stripe_response["status"] == "succeeded":
                payment.status = PaymentStatus.COMPLETED
                payment.processed_at = datetime.utcnow()
            else:
                payment.status = PaymentStatus.FAILED
        
        elif payment.payment_method == PaymentMethod.PAYPAL:
            # PayPal Payment bestätigen
            paypal_response = await paypal_service.get_payment_details(
                payment.gateway_payment_id
            )
            
            if paypal_response["state"] == "approved":
                payment.status = PaymentStatus.COMPLETED
                payment.processed_at = datetime.utcnow()
            else:
                payment.status = PaymentStatus.FAILED
        
        session.commit()
        
        return XSSProtection.create_safe_response({
            "payment_id": payment.payment_id,
            "status": payment.status,
            "processed_at": payment.processed_at
        }, "Payment confirmed")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment confirmation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Payment confirmation failed"
        )

@router.post("/subscriptions/create", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Erstelle neue Subscription"""
    
    try:
        # Input-Validierung
        validated_data = SecurityValidator.validate_json_input(
            subscription_data.dict(), "subscription_data"
        )
        
        # Subscription in Datenbank speichern
        subscription = Subscription(
            user_id=current_user.id,
            plan=validated_data["plan"],
            amount=validated_data["amount"],
            currency=validated_data["currency"],
            billing_cycle=validated_data["billing_cycle"],
            status=PaymentStatus.PENDING,
            next_billing_date=datetime.utcnow() + timedelta(days=30)
        )
        
        session.add(subscription)
        session.commit()
        session.refresh(subscription)
        
        # Payment Gateway-spezifische Logik
        if subscription_data.plan == SubscriptionPlan.BASIC:
            # Stripe Subscription erstellen
            stripe_response = await stripe_service.create_subscription(
                customer_id=current_user.stripe_customer_id,
                price_id=config.STRIPE_BASIC_PRICE_ID
            )
            
            subscription.gateway_subscription_id = stripe_response["subscription_id"]
            subscription.status = PaymentStatus.PROCESSING
        
        session.commit()
        
        # Sichere Response erstellen
        response_data = XSSProtection.create_safe_response({
            "subscription_id": subscription.subscription_id,
            "plan": subscription.plan,
            "status": subscription.status,
            "amount": subscription.amount,
            "currency": subscription.currency,
            "next_billing_date": subscription.next_billing_date,
            "created_at": subscription.created_at
        }, "Subscription erfolgreich erstellt")
        
        return SubscriptionResponse(**response_data["data"])
        
    except Exception as e:
        logger.error(f"Subscription creation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Subscription creation failed"
        )

@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Hole Subscription-Details"""
    
    try:
        # Input-Validierung
        subscription_id = SecurityValidator.validate_string_input(subscription_id, "subscription_id", 100)
        
        # Subscription aus Datenbank holen
        statement = select(Subscription).where(
            Subscription.subscription_id == subscription_id,
            Subscription.user_id == current_user.id
        )
        subscription = session.exec(statement).first()
        
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found"
            )
        
        # Sichere Response erstellen
        response_data = XSSProtection.create_safe_response({
            "subscription_id": subscription.subscription_id,
            "plan": subscription.plan,
            "status": subscription.status,
            "amount": subscription.amount,
            "currency": subscription.currency,
            "next_billing_date": subscription.next_billing_date,
            "created_at": subscription.created_at
        }, "Subscription details retrieved")
        
        return SubscriptionResponse(**response_data["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Subscription retrieval error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Subscription retrieval failed"
        )

@router.post("/webhooks/stripe")
async def stripe_webhook(
    payload: str = Body(...),
    stripe_signature: str = Depends(lambda: None)  # Wird aus Header extrahiert
):
    """Stripe Webhook Handler"""
    
    try:
        # Webhook verarbeiten
        webhook_response = await stripe_service.process_webhook(
            payload=payload,
            signature=stripe_signature
        )
        
        logger.info(f"Stripe webhook processed: {webhook_response}")
        
        return XSSProtection.create_safe_response(
            webhook_response,
            "Webhook processed successfully"
        )
        
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Webhook processing failed"
        )

@router.post("/webhooks/paypal")
async def paypal_webhook(
    payload: Dict[str, Any] = Body(...)
):
    """PayPal Webhook Handler"""
    
    try:
        # Webhook verarbeiten
        webhook_response = await paypal_service.process_webhook(payload)
        
        logger.info(f"PayPal webhook processed: {webhook_response}")
        
        return XSSProtection.create_safe_response(
            webhook_response,
            "Webhook processed successfully"
        )
        
    except Exception as e:
        logger.error(f"PayPal webhook error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Webhook processing failed"
        )

@router.get("/user/payments")
async def get_user_payments(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Hole alle Payments des Users"""
    
    try:
        # Paginierung
        offset = (page - 1) * page_size
        
        # Payments aus Datenbank holen
        statement = select(Payment).where(
            Payment.user_id == current_user.id
        ).offset(offset).limit(page_size)
        
        payments = session.exec(statement).all()
        
        # Sichere Response erstellen
        payments_data = []
        for payment in payments:
            payments_data.append({
                "payment_id": payment.payment_id,
                "status": payment.status,
                "amount": payment.amount,
                "currency": payment.currency,
                "payment_method": payment.payment_method,
                "created_at": payment.created_at
            })
        
        return XSSProtection.create_safe_response({
            "payments": payments_data,
            "page": page,
            "page_size": page_size,
            "total": len(payments_data)
        }, "User payments retrieved")
        
    except Exception as e:
        logger.error(f"User payments retrieval error: {e}")
        raise HTTPException(
            status_code=500,
            detail="User payments retrieval failed"
        )

@router.get("/user/subscriptions")
async def get_user_subscriptions(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Hole alle Subscriptions des Users"""
    
    try:
        # Subscriptions aus Datenbank holen
        statement = select(Subscription).where(
            Subscription.user_id == current_user.id
        )
        
        subscriptions = session.exec(statement).all()
        
        # Sichere Response erstellen
        subscriptions_data = []
        for subscription in subscriptions:
            subscriptions_data.append({
                "subscription_id": subscription.subscription_id,
                "plan": subscription.plan,
                "status": subscription.status,
                "amount": subscription.amount,
                "currency": subscription.currency,
                "next_billing_date": subscription.next_billing_date,
                "created_at": subscription.created_at
            })
        
        return XSSProtection.create_safe_response({
            "subscriptions": subscriptions_data,
            "total": len(subscriptions_data)
        }, "User subscriptions retrieved")
        
    except Exception as e:
        logger.error(f"User subscriptions retrieval error: {e}")
        raise HTTPException(
            status_code=500,
            detail="User subscriptions retrieval failed"
        )
