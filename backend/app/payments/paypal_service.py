"""
PayPal Payment Service für Monetarisierung
"""
import requests
import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from models.payment import Payment, PaymentStatus, PaymentMethod, TransactionType
from app.security.input_validation import SecurityValidator

logger = logging.getLogger(__name__)

class PayPalService:
    """PayPal Payment Gateway Service"""
    
    def __init__(self, client_id: str, client_secret: str, sandbox: bool = True):
        """Initialize PayPal service"""
        self.client_id = client_id
        self.client_secret = client_secret
        self.sandbox = sandbox
        self.base_url = "https://api.sandbox.paypal.com" if sandbox else "https://api.paypal.com"
        self.access_token = None
        self.token_expires_at = None
    
    async def _get_access_token(self) -> str:
        """Get PayPal access token"""
        
        # Check if token is still valid
        if self.access_token and self.token_expires_at and datetime.utcnow() < self.token_expires_at:
            return self.access_token
        
        try:
            # Prepare authentication data
            auth_data = {
                "grant_type": "client_credentials"
            }
            
            # Prepare headers
            headers = {
                "Accept": "application/json",
                "Accept-Language": "en_US",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v1/oauth2/token",
                data=auth_data,
                headers=headers,
                auth=(self.client_id, self.client_secret)
            )
            
            response.raise_for_status()
            token_data = response.json()
            
            # Store token and expiration
            self.access_token = token_data["access_token"]
            expires_in = token_data.get("expires_in", 3600)
            self.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in - 60)
            
            logger.info("PayPal access token obtained")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal token request error: {e}")
            raise Exception(f"PayPal authentication failed: {str(e)}")
        except Exception as e:
            logger.error(f"PayPal token error: {e}")
            raise Exception(f"PayPal authentication failed: {str(e)}")
    
    async def create_payment(
        self, 
        amount: float, 
        currency: str = "EUR",
        description: Optional[str] = None,
        return_url: str = "https://kleinanzeigen.com/payment/success",
        cancel_url: str = "https://kleinanzeigen.com/payment/cancel"
    ) -> Dict[str, Any]:
        """Create PayPal Payment"""
        
        try:
            # Input validation
            amount = SecurityValidator.validate_string_input(str(amount), "amount")
            currency = SecurityValidator.validate_string_input(currency, "currency", 3)
            
            if description:
                description = SecurityValidator.validate_string_input(description, "description", 500)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare payment data
            payment_data = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "total": str(amount),
                        "currency": currency.upper()
                    },
                    "description": description or "Kleinanzeigen Payment",
                    "item_list": {
                        "items": [{
                            "name": "Kleinanzeigen Service",
                            "sku": "kleinanzeigen-001",
                            "price": str(amount),
                            "currency": currency.upper(),
                            "quantity": 1
                        }]
                    }
                }],
                "redirect_urls": {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                }
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v1/payments/payment",
                json=payment_data,
                headers=headers
            )
            
            response.raise_for_status()
            payment_response = response.json()
            
            logger.info(f"PayPal payment created: {payment_response['id']}")
            
            # Extract approval URL
            approval_url = None
            for link in payment_response.get("links", []):
                if link.get("rel") == "approval_url":
                    approval_url = link.get("href")
                    break
            
            return {
                "payment_id": payment_response["id"],
                "approval_url": approval_url,
                "amount": amount,
                "currency": currency,
                "status": payment_response["state"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal payment creation error: {e}")
            raise Exception(f"Payment creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment creation error: {e}")
            raise Exception(f"Payment creation failed: {str(e)}")
    
    async def execute_payment(
        self, 
        payment_id: str, 
        payer_id: str
    ) -> Dict[str, Any]:
        """Execute PayPal Payment"""
        
        try:
            # Input validation
            payment_id = SecurityValidator.validate_string_input(payment_id, "payment_id", 100)
            payer_id = SecurityValidator.validate_string_input(payer_id, "payer_id", 100)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare execution data
            execution_data = {
                "payer_id": payer_id
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v1/payments/payment/{payment_id}/execute",
                json=execution_data,
                headers=headers
            )
            
            response.raise_for_status()
            execution_response = response.json()
            
            logger.info(f"PayPal payment executed: {payment_id}")
            
            return {
                "payment_id": execution_response["id"],
                "state": execution_response["state"],
                "amount": execution_response["transactions"][0]["amount"]["total"],
                "currency": execution_response["transactions"][0]["amount"]["currency"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal payment execution error: {e}")
            raise Exception(f"Payment execution failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment execution error: {e}")
            raise Exception(f"Payment execution failed: {str(e)}")
    
    async def create_subscription(
        self, 
        plan_id: str, 
        start_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Create PayPal Subscription"""
        
        try:
            # Input validation
            plan_id = SecurityValidator.validate_string_input(plan_id, "plan_id", 100)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare subscription data
            subscription_data = {
                "plan_id": plan_id,
                "start_time": (start_time or datetime.utcnow()).isoformat() + "Z",
                "subscriber": {
                    "name": {
                        "given_name": "Kleinanzeigen",
                        "surname": "User"
                    }
                },
                "application_context": {
                    "brand_name": "Kleinanzeigen",
                    "locale": "de-DE",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": "https://kleinanzeigen.com/subscription/success",
                    "cancel_url": "https://kleinanzeigen.com/subscription/cancel"
                }
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
                "PayPal-Request-Id": f"subscription-{datetime.utcnow().timestamp()}"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v1/billing/subscriptions",
                json=subscription_data,
                headers=headers
            )
            
            response.raise_for_status()
            subscription_response = response.json()
            
            logger.info(f"PayPal subscription created: {subscription_response['id']}")
            
            # Extract approval URL
            approval_url = None
            for link in subscription_response.get("links", []):
                if link.get("rel") == "approve":
                    approval_url = link.get("href")
                    break
            
            return {
                "subscription_id": subscription_response["id"],
                "approval_url": approval_url,
                "status": subscription_response["status"],
                "plan_id": plan_id
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal subscription creation error: {e}")
            raise Exception(f"Subscription creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Subscription creation error: {e}")
            raise Exception(f"Subscription creation failed: {str(e)}")
    
    async def create_billing_plan(
        self, 
        name: str, 
        description: str, 
        amount: float, 
        currency: str = "EUR",
        interval: str = "MONTH"
    ) -> str:
        """Create PayPal Billing Plan"""
        
        try:
            # Input validation
            name = SecurityValidator.validate_string_input(name, "name", 100)
            description = SecurityValidator.validate_string_input(description, "description", 500)
            amount = SecurityValidator.validate_string_input(str(amount), "amount")
            currency = SecurityValidator.validate_string_input(currency, "currency", 3)
            interval = SecurityValidator.validate_string_input(interval, "interval", 20)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare plan data
            plan_data = {
                "product_id": f"kleinanzeigen-{name.lower().replace(' ', '-')}",
                "name": name,
                "description": description,
                "status": "ACTIVE",
                "billing_cycles": [{
                    "frequency": {
                        "interval_unit": interval,
                        "interval_count": 1
                    },
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": str(amount),
                            "currency_code": currency.upper()
                        }
                    }
                }],
                "payment_preferences": {
                    "auto_bill_outstanding": True,
                    "setup_fee": {
                        "value": "0",
                        "currency_code": currency.upper()
                    },
                    "setup_fee_failure_action": "CONTINUE",
                    "payment_failure_threshold": 3
                }
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v1/billing/plans",
                json=plan_data,
                headers=headers
            )
            
            response.raise_for_status()
            plan_response = response.json()
            
            logger.info(f"PayPal billing plan created: {plan_response['id']}")
            return plan_response["id"]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal billing plan creation error: {e}")
            raise Exception(f"Billing plan creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Billing plan creation error: {e}")
            raise Exception(f"Billing plan creation failed: {str(e)}")
    
    async def refund_payment(
        self, 
        capture_id: str, 
        amount: Optional[float] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Refund PayPal Payment"""
        
        try:
            # Input validation
            capture_id = SecurityValidator.validate_string_input(capture_id, "capture_id", 100)
            reason = SecurityValidator.validate_string_input(reason, "reason", 50)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare refund data
            refund_data = {
                "amount": {
                    "value": str(amount) if amount else "0",
                    "currency_code": "EUR"
                },
                "note_to_payer": f"Refund: {reason}"
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            # Make request
            response = requests.post(
                f"{self.base_url}/v2/payments/captures/{capture_id}/refund",
                json=refund_data,
                headers=headers
            )
            
            response.raise_for_status()
            refund_response = response.json()
            
            logger.info(f"PayPal refund created: {refund_response['id']}")
            
            return {
                "refund_id": refund_response["id"],
                "amount": refund_response["amount"]["value"],
                "status": refund_response["status"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal refund error: {e}")
            raise Exception(f"Refund failed: {str(e)}")
        except Exception as e:
            logger.error(f"Refund error: {e}")
            raise Exception(f"Refund failed: {str(e)}")
    
    async def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """Get PayPal payment details"""
        
        try:
            # Input validation
            payment_id = SecurityValidator.validate_string_input(payment_id, "payment_id", 100)
            
            # Get access token
            access_token = await self._get_access_token()
            
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {access_token}"
            }
            
            # Make request
            response = requests.get(
                f"{self.base_url}/v1/payments/payment/{payment_id}",
                headers=headers
            )
            
            response.raise_for_status()
            payment_response = response.json()
            
            return {
                "id": payment_response["id"],
                "state": payment_response["state"],
                "amount": payment_response["transactions"][0]["amount"]["total"],
                "currency": payment_response["transactions"][0]["amount"]["currency"],
                "created_time": payment_response["create_time"]
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal payment details error: {e}")
            raise Exception(f"Payment details retrieval failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment details error: {e}")
            raise Exception(f"Payment details retrieval failed: {str(e)}")
