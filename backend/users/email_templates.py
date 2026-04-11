import resend
from django.conf import settings


def _get_required_setting(name):
    value = str(getattr(settings, name, '') or '').strip()
    if not value:
        raise ValueError(f"Missing required setting: {name}")
    return value


def _send_resend_template_email(*, to_email, template_id, variables):
    resend.api_key = _get_required_setting('RESEND_API_KEY')
    sender = _get_required_setting('RESEND_FROM_EMAIL')

    params = {
        'from': sender,
        'to': [to_email],
        'template': {
            'id': template_id,
            'variables': variables,
        },
    }

    return resend.Emails.send(params)


def send_activation_template_email(*, recipient_email, cashier_name, activation_url):
    template_id = _get_required_setting('RESEND_ACTIVATION_TEMPLATE_ID')

    return _send_resend_template_email(
        to_email=recipient_email,
        template_id=template_id,
        variables={
            'cashier_name': cashier_name,
            'activation_url': activation_url,
        },
    )


def send_otp_template_email(*, recipient_email, cashier_name, otp_value):
    template_id = _get_required_setting('RESEND_OTP_TEMPLATE_ID')

    return _send_resend_template_email(
        to_email=recipient_email,
        template_id=template_id,
        variables={
            'cashier_name': cashier_name,
            'otp_value': otp_value,
        },
    )
