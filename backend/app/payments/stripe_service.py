"""
Stripe Payment Service für Monetarisierung
"""
import stripe
import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from models.payment import Payment, PaymentStatus, PaymentMethod, TransactionType
from app.security.input_validation import SecurityValidator

logger = logging.getLogger(__name__)

class StripeService:
    """Stripe Payment Gateway Service"""
    
    def __init__(self, api_key: str, webhook_secret: str):
        """Initialize Stripe service"""
        self.api_key = api_key
        self.webhook_secret = webhook_secret
        stripe.api_key = api_key
    
    async def create_payment_intent(
        self, 
        amount: float, 
        currency: str = "EUR",
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create Stripe Payment Intent"""
        
        try:
            # Input validation
            amount = SecurityValidator.validate_string_input(str(amount), "amount")
            currency = SecurityValidator.validate_string_input(currency, "currency", 3)
            
            if description:
                description = SecurityValidator.validate_string_input(description, "description", 500)
            
            # Convert amount to cents
            amount_cents = int(float(amount) * 100)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                description=description,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            logger.info(f"Stripe Payment Intent created: {intent.id}")
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": amount_cents,
                "currency": currency,
                "status": intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            raise Exception(f"Payment creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment creation error: {e}")
            raise Exception(f"Payment creation failed: {str(e)}")
    
    async def create_customer(
        self, 
        user_id: int, 
        email: str, 
        name: Optional[str] = None
    ) -> str:
        """Create Stripe Customer"""
        
        try:
            # Input validation
            email = SecurityValidator.validate_email(email)
            if name:
                name = SecurityValidator.validate_string_input(name, "name", 100)
            
            # Create customer
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    "user_id": str(user_id),
                    "platform": "kleinanzeigen"
                }
            )
            
            logger.info(f"Stripe Customer created: {customer.id}")
            return customer.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation error: {e}")
            raise Exception(f"Customer creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Customer creation error: {e}")
            raise Exception(f"Customer creation failed: {str(e)}")
    
    async def create_subscription(
        self, 
        customer_id: str, 
        price_id: str,
        trial_period_days: Optional[int] = None
    ) -> Dict[str, Any]:
        """Create Stripe Subscription"""
        
        try:
            # Input validation
            customer_id = SecurityValidator.validate_string_input(customer_id, "customer_id", 100)
            price_id = SecurityValidator.validate_string_input(price_id, "price_id", 100)
            
            # Subscription parameters
            subscription_params = {
                "customer": customer_id,
                "items": [{"price": price_id}],
                "payment_behavior": "default_incomplete",
                "payment_settings": {"save_default_payment_method": "on_subscription"},
                "expand": ["latest_invoice.payment_intent"],
            }
            
            if trial_period_days:
                subscription_params["trial_period_days"] = trial_period_days
            
            # Create subscription
            subscription = stripe.Subscription.create(**subscription_params)
            
            logger.info(f"Stripe Subscription created: {subscription.id}")
            
            return {
                "subscription_id": subscription.id,
                "client_secret": subscription.latest_invoice.payment_intent.client_secret,
                "status": subscription.status,
                "current_period_end": subscription.current_period_end
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription creation error: {e}")
            raise Exception(f"Subscription creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Subscription creation error: {e}")
            raise Exception(f"Subscription creation failed: {str(e)}")
    
    async def create_price(
        self, 
        amount: float, 
        currency: str = "EUR",
        interval: str = "month",
        product_name: str = "Kleinanzeigen Subscription"
    ) -> str:
        """Create Stripe Price"""
        
        try:
            # Input validation
            amount = SecurityValidator.validate_string_input(str(amount), "amount")
            currency = SecurityValidator.validate_string_input(currency, "currency", 3)
            interval = SecurityValidator.validate_string_input(interval, "interval", 20)
            product_name = SecurityValidator.validate_string_input(product_name, "product_name", 100)
            
            # Convert amount to cents
            amount_cents = int(float(amount) * 100)
            
            # Create product first
            product = stripe.Product.create(
                name=product_name,
                description=f"Monthly subscription for {product_name}"
            )
            
            # Create price
            price = stripe.Price.create(
                unit_amount=amount_cents,
                currency=currency.lower(),
                recurring={"interval": interval},
                product=product.id
            )
            
            logger.info(f"Stripe Price created: {price.id}")
            return price.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe price creation error: {e}")
            raise Exception(f"Price creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Price creation error: {e}")
            raise Exception(f"Price creation failed: {str(e)}")
    
    async def process_webhook(
        self, 
        payload: str, 
        signature: str
    ) -> Dict[str, Any]:
        """Process Stripe Webhook"""
        
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            logger.info(f"Stripe webhook received: {event['type']}")
            
            # Process different event types
            if event['type'] == 'payment_intent.succeeded':
                return await self._handle_payment_succeeded(event['data']['object'])
            elif event['type'] == 'payment_intent.payment_failed':
                return await self._handle_payment_failed(event['data']['object'])
            elif event['type'] == 'invoice.payment_succeeded':
                return await self._handle_invoice_payment_succeeded(event['data']['object'])
            elif event['type'] == 'customer.subscription.updated':
                return await self._handle_subscription_updated(event['data']['object'])
            elif event['type'] == 'customer.subscription.deleted':
                return await self._handle_subscription_deleted(event['data']['object'])
            else:
                logger.info(f"Unhandled webhook event: {event['type']}")
                return {"status": "ignored", "event_type": event['type']}
                
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Stripe webhook signature verification failed: {e}")
            raise Exception("Invalid webhook signature")
        except Exception as e:
            logger.error(f"Webhook processing error: {e}")
            raise Exception(f"Webhook processing failed: {str(e)}")
    
    async def _handle_payment_succeeded(self, payment_intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment"""
        
        logger.info(f"Payment succeeded: {payment_intent['id']}")
        
        return {
            "status": "success",
            "payment_intent_id": payment_intent['id'],
            "amount": payment_intent['amount'],
            "currency": payment_intent['currency']
        }
    
    async def _handle_payment_failed(self, payment_intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment"""
        
        logger.warning(f"Payment failed: {payment_intent['id']}")
        
        return {
            "status": "failed",
            "payment_intent_id": payment_intent['id'],
            "error": payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
        }
    
    async def _handle_invoice_payment_succeeded(self, invoice: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful invoice payment"""
        
        logger.info(f"Invoice payment succeeded: {invoice['id']}")
        
        return {
            "status": "success",
            "invoice_id": invoice['id'],
            "subscription_id": invoice.get('subscription'),
            "amount": invoice['amount_paid']
        }
    
    async def _handle_subscription_updated(self, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription update"""
        
        logger.info(f"Subscription updated: {subscription['id']}")
        
        return {
            "status": "updated",
            "subscription_id": subscription['id'],
            "status": subscription['status']
        }
    
    async def _handle_subscription_deleted(self, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription deletion"""
        
        logger.info(f"Subscription deleted: {subscription['id']}")
        
        return {
            "status": "deleted",
            "subscription_id": subscription['id']
        }
    
    async def refund_payment(
        self, 
        payment_intent_id: str, 
        amount: Optional[float] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Refund payment"""
        
        try:
            # Input validation
            payment_intent_id = SecurityValidator.validate_string_input(payment_intent_id, "payment_intent_id", 100)
            reason = SecurityValidator.validate_string_input(reason, "reason", 50)
            
            # Refund parameters
            refund_params = {
                "payment_intent": payment_intent_id,
                "reason": reason
            }
            
            if amount:
                refund_params["amount"] = int(amount * 100)  # Convert to cents
            
            # Create refund
            refund = stripe.Refund.create(**refund_params)
            
            logger.info(f"Stripe refund created: {refund.id}")
            
            return {
                "refund_id": refund.id,
                "amount": refund.amount,
                "status": refund.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund error: {e}")
            raise Exception(f"Refund failed: {str(e)}")
        except Exception as e:
            logger.error(f"Refund error: {e}")
            raise Exception(f"Refund failed: {str(e)}")
    
    async def get_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Get payment intent details"""
        
        try:
            # Input validation
            payment_intent_id = SecurityValidator.validate_string_input(payment_intent_id, "payment_intent_id", 100)
            
            # Retrieve payment intent
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "id": intent.id,
                "amount": intent.amount,
                "currency": intent.currency,
                "status": intent.status,
                "client_secret": intent.client_secret,
                "created": intent.created
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent retrieval error: {e}")
            raise Exception(f"Payment intent retrieval failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment intent retrieval error: {e}")
            raise Exception(f"Payment intent retrieval failed: {str(e)}")
