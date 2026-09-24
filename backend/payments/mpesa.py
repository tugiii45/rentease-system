import base64
import requests
from datetime import datetime
from django.conf import settings


def get_base_url():
    if settings.MPESA_ENV == 'production':
        return 'https://api.safaricom.co.ke'
    return 'https://sandbox.safaricom.co.ke'


def get_access_token():
    """
    Authenticates with Daraja using Consumer Key + Secret.
    Returns a short-lived access token used for all subsequent API calls.
    """
    url = f"{get_base_url()}/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(
        url,
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
    )
    response.raise_for_status()
    return response.json()['access_token']


def generate_password_and_timestamp():
    """
    Daraja requires a Base64-encoded password made of:
    Shortcode + Passkey + Timestamp
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    raw_password = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    encoded_password = base64.b64encode(raw_password.encode()).decode()
    return encoded_password, timestamp


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    """
    Sends an STK Push prompt to the given phone number.
    phone_number must be in format 2547XXXXXXXX (no + or leading 0).
    """
    access_token = get_access_token()
    password, timestamp = generate_password_and_timestamp()

    url = f"{get_base_url()}/mpesa/stkpush/v1/processrequest"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()