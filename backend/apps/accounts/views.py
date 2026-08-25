from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


class GoogleLogin(SocialLoginView):
    """
    Google OAuth2 Social Login API Endpoint.
    Accepts access_token or id_token from the React frontend,
    authenticates or registers the user, and returns DRF auth token/user details.
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
