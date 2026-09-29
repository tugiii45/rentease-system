import requests


def send_push_notification(push_token, title, body, data=None):
    if not push_token:
        return
    try:
        requests.post(
            'https://exp.host/--/api/v2/push/send',
            json={
                "to": push_token,
                "title": title,
                "body": body,
                "data": data or {},
                "sound": "default",
            },
            headers={"Content-Type": "application/json"},
            timeout=5,
        )
    except requests.RequestException:
        pass  # Don't let a failed push crash the main action (e.g. posting a notice)