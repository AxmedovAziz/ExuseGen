# from google.oauth2.credentials import Credentials
# from google.auth.transport.requests import Request
# from allauth.socialaccount.models import SocialAccount, SocialToken
# from django.conf import settings
# import logging

# logger = logging.getLogger(__name__)

# def get_gmail_credentials(user):
#     try:
#         social_account = SocialAccount.objects.get(user=user, provider='google')
#         social_token = SocialToken.objects.get(account=social_account)
#     except (SocialAccount.DoesNotExist, SocialToken.DoesNotExist):
#         logger.warning("No Google social account/token for user %s", user)
#         return None

#     refresh_token = social_account.extra_data.get('refresh_token')
#     if not refresh_token:
#         logger.warning("No refresh token for user %s", user)
#         return None

#     credentials = Credentials(
#         token=social_token.token,
#         refresh_token=refresh_token,
#         token_uri="https://oauth2.googleapis.com/token",
#         client_id=settings.GOOGLE_CLIENT_ID,
#         client_secret=settings.GOOGLE_CLIENT_SECRET,
#         scopes=["https://www.googleapis.com/auth/gmail.send"]
#     )

#     if credentials.expired:
#         try:
#             credentials.refresh(Request())
#             social_token.token = credentials.token
#             social_token.expires_at = credentials.expiry
#             social_token.save()
#         except Exception as e:
#             logger.error("Failed to refresh token: %s", e)
#             return None

#     return credentials