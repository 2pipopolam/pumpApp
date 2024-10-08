# pamp_app/adapters.py

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # If user is already logged in, do nothing
        if request.user.is_authenticated:
            return

        # Try to find an existing user with the same email address
        email = sociallogin.account.extra_data.get('email', '').lower()
        if not email:
            return  # Email is required; if not present, cannot proceed

        try:
            user = User.objects.get(email=email)
            # Associate the social account with the existing user
            sociallogin.connect(request, user)
        except User.DoesNotExist:
            pass  # No user exists with this email, proceed normally

