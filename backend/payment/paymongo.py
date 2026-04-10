import requests
import base64
from django.conf import settings

class PayMongoWrapper:
    BASE_URL = settings.PAYMONGO_BASE_URL
    
    # Encode the secret key for Basic Auth
    def _get_headers(self):
        # Ensure PAYMONGO_SECRET_KEY is in your settings.py
        secret_key = settings.PAYMONGO_SECRET_KEY
        encoded_key = base64.b64encode(f"{secret_key}:".encode()).decode()
        return {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Basic {encoded_key}"
        }

    def create_source(
        self,
        amount,
        currency="PHP",
        redirect_success="",
        redirect_failed="",
        billing_name="",
        billing_phone="",
    ):
        url = f"{self.BASE_URL}/sources"
        attributes = {
            "amount": int(amount * 100), # Convert to centavos
            "type": "gcash",
            "currency": currency,
            "redirect": {
                "success": redirect_success,
                "failed": redirect_failed
            }
        }

        billing = {}
        if billing_name:
            billing["name"] = billing_name
        if billing_phone:
            billing["phone"] = billing_phone
        if billing:
            attributes["billing"] = billing

        payload = {
            "data": {
                "attributes": attributes
            }
        }
        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status() # Raise error if PayMongo fails
        return response.json()['data']

    def create_payment(self, source_id, amount, description):
        url = f"{self.BASE_URL}/payments"
        payload = {
            "data": {
                "attributes": {
                    "amount": int(amount), # Already in centavos from the webhook
                    "currency": "PHP",
                    "description": description,
                    "source": {
                        "id": source_id,
                        "type": "source"
                    }
                }
            }
        }
        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status()
        return response.json()['data']

    def get_source(self, source_id):
        """Retrieve a source to check its current status."""
        url = f"{self.BASE_URL}/sources/{source_id}"
        response = requests.get(url, headers=self._get_headers())
        response.raise_for_status()
        return response.json()['data']