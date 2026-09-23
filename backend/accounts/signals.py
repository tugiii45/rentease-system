from django.core.mail import send_mail
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.conf import settings


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    reset_url = f"{settings.FRONTEND_RESET_URL}?token={reset_password_token.key}"

    send_mail(
        subject="Reset your Rentease password",
        message=f"Hi {reset_password_token.user.first_name},\n\n"
                f"Click the link below to reset your password:\n{reset_url}\n\n"
                f"If you didn't request this, ignore this email.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[reset_password_token.user.email],
    )