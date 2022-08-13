from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed


from datetime import timedelta
from django.utils import timezone
from django.conf import settings


def ExpiresIn(token):
    # Calculates how long the token has existed using timezone.now() and the timestamp it was created. The time remaining is then calculated.
    time_elapsed = timezone.now() - token.created
    left_time = timedelta(seconds=settings.TOKEN_EXPIRE_AFTER_SECONDS) - time_elapsed
    return left_time


def TokenExpireChecker(token):
    is_expired = ExpiresIn(token) < timedelta(seconds=0)
    if is_expired:
        # If the token has expired, delete the token and create a new one.
        token.delete()
        token = Token.objects.create(user=token.user)
    return is_expired, token


# Add to settings.py
class ExpiringTokenAuthentication(TokenAuthentication):
    # Class that extends TokenAuthentication by adding expiry checks. If the token is detected was expired, return an AuthenticationFailed...
    # ...(yes, even though a new one was generated).
    def authenticate_credentials(self, key):
        try:
            token = Token.objects.get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed
        is_expired, token = TokenExpireChecker(token)
        if is_expired:
            raise AuthenticationFailed("Current token has expired.")

        return (token.user, token)
