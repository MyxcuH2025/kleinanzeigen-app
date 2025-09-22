"""
Payment Models für Monetarisierung
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON, Text
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class PaymentStatus(str, Enum):
    """Payment Status Enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"

class PaymentMethod(str, Enum):
    """Payment Method Enumeration"""
    STRIPE = "stripe"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"

class TransactionType(str, Enum):
    """Transaction Type Enumeration"""
    PAYMENT = "payment"
    REFUND = "refund"
    CHARGEBACK = "chargeback"
    FEE = "fee"
    COMMISSION = "commission"

class SubscriptionPlan(str, Enum):
    """Subscription Plan Enumeration"""
    BASIC = "basic"
    PREMIUM = "premium"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class Payment(SQLModel, table=True):
    """Payment Transaction Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    payment_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # User Information
    user_id: int = Field(foreign_key="users.id", index=True)
    # user: Optional["User"] = Relationship(back_populates="payments")  # Temporär deaktiviert
    
    # Payment Details
    amount: float = Field(description="Amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    payment_method: PaymentMethod = Field(description="Payment method used")
    transaction_type: TransactionType = Field(default=TransactionType.PAYMENT)
    
    # Gateway Information
    gateway_payment_id: Optional[str] = Field(default=None, description="Gateway payment ID")
    gateway_transaction_id: Optional[str] = Field(default=None, description="Gateway transaction ID")
    gateway_fee: Optional[float] = Field(default=None, description="Gateway processing fee")
    
    # Payment Metadata
    description: Optional[str] = Field(default=None, description="Payment description")
    payment_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON), description="Additional metadata")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    
    # Refund Information
    refunded_amount: float = Field(default=0.0, description="Amount refunded")
    refund_reason: Optional[str] = Field(default=None, description="Reason for refund")
    
    # Webhook Information
    webhook_received: bool = Field(default=False, description="Webhook received from gateway")
    webhook_processed: bool = Field(default=False, description="Webhook processed")

class Subscription(SQLModel, table=True):
    """Subscription Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    subscription_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # User Information
    user_id: int = Field(foreign_key="users.id", index=True)
    # user: Optional["User"] = Relationship(back_populates="subscriptions")  # Temporär deaktiviert
    
    # Subscription Details
    plan: SubscriptionPlan = Field(description="Subscription plan")
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    amount: float = Field(description="Monthly amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    
    # Billing Information
    billing_cycle: str = Field(default="monthly", description="Billing cycle")
    next_billing_date: Optional[datetime] = Field(default=None, description="Next billing date")
    trial_end_date: Optional[datetime] = Field(default=None, description="Trial end date")
    
    # Gateway Information
    gateway_subscription_id: Optional[str] = Field(default=None, description="Gateway subscription ID")
    gateway_customer_id: Optional[str] = Field(default=None, description="Gateway customer ID")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cancelled_at: Optional[datetime] = Field(default=None, description="Cancellation date")
    
    # Subscription Metadata
    features: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON), description="Plan features")
    limits: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON), description="Plan limits")

class Invoice(SQLModel, table=True):
    """Invoice Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # User Information
    user_id: int = Field(foreign_key="users.id", index=True)
    # user: Optional["User"] = Relationship(back_populates="invoices")  # Temporär deaktiviert
    
    # Invoice Details
    amount: float = Field(description="Invoice amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    
    # Billing Information
    billing_address: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON), description="Billing address")
    tax_amount: Optional[float] = Field(default=None, description="Tax amount")
    total_amount: float = Field(description="Total amount including tax")
    
    # Payment Information
    payment_id: Optional[int] = Field(foreign_key="payment.id", default=None)
    payment: Optional[Payment] = Relationship()
    
    # Invoice Items
    items: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON), description="Invoice items")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = Field(default=None, description="Due date")
    paid_at: Optional[datetime] = Field(default=None, description="Payment date")
    
    # PDF Generation
    pdf_generated: bool = Field(default=False, description="PDF generated")
    pdf_path: Optional[str] = Field(default=None, description="PDF file path")

class PaymentWebhook(SQLModel, table=True):
    """Payment Webhook Model"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    webhook_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Webhook Details
    gateway: str = Field(description="Payment gateway")
    event_type: str = Field(description="Webhook event type")
    payload: Dict[str, Any] = Field(sa_column=Column(JSON), description="Webhook payload")
    
    # Processing Status
    processed: bool = Field(default=False, description="Webhook processed")
    processed_at: Optional[datetime] = Field(default=None, description="Processing timestamp")
    error_message: Optional[str] = Field(default=None, description="Processing error")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Retry Information
    retry_count: int = Field(default=0, description="Retry attempts")
    max_retries: int = Field(default=3, description="Maximum retries")

# Pydantic Models für API
class PaymentCreate(SQLModel):
    """Payment Creation Model"""
    amount: float = Field(description="Amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    payment_method: PaymentMethod = Field(description="Payment method")
    description: Optional[str] = Field(default=None, description="Payment description")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class PaymentUpdate(SQLModel):
    """Payment Update Model"""
    status: Optional[PaymentStatus] = Field(default=None, description="Payment status")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class SubscriptionCreate(SQLModel):
    """Subscription Creation Model"""
    plan: SubscriptionPlan = Field(description="Subscription plan")
    amount: float = Field(description="Monthly amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    billing_cycle: str = Field(default="monthly", description="Billing cycle")

class SubscriptionUpdate(SQLModel):
    """Subscription Update Model"""
    plan: Optional[SubscriptionPlan] = Field(default=None, description="Subscription plan")
    status: Optional[PaymentStatus] = Field(default=None, description="Subscription status")

class InvoiceCreate(SQLModel):
    """Invoice Creation Model"""
    amount: float = Field(description="Invoice amount in cents")
    currency: str = Field(default="EUR", description="Currency code")
    billing_address: Optional[Dict[str, Any]] = Field(default=None, description="Billing address")
    items: Optional[List[Dict[str, Any]]] = Field(default=None, description="Invoice items")

class PaymentResponse(SQLModel):
    """Payment Response Model"""
    payment_id: str
    status: PaymentStatus
    amount: float
    currency: str
    payment_method: PaymentMethod
    gateway_payment_id: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

class SubscriptionResponse(SQLModel):
    """Subscription Response Model"""
    subscription_id: str
    plan: SubscriptionPlan
    status: PaymentStatus
    amount: float
    currency: str
    next_billing_date: Optional[datetime] = None
    created_at: datetime

class InvoiceResponse(SQLModel):
    """Invoice Response Model"""
    invoice_id: str
    amount: float
    currency: str
    status: PaymentStatus
    due_date: Optional[datetime] = None
    created_at: datetime
