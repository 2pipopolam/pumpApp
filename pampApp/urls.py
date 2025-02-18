"""
URL configuration for pampApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.http import JsonResponse,HttpResponse
from rest_framework.decorators import api_view, permission_classes
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from pamp_app import views
from pamp_app.views import GoogleLogin


from pamp_app.views import LinkTelegramView, LinkTelegramStatusView, LinkTelegramConfirmView,UserTrainingSessionsView ,TrainingSessionViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)



#from pamp_app.views import FileUploadView

router = DefaultRouter()
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'posts', views.PostViewSet,basename='posts')
router.register(r'training-sessions', views.TrainingSessionViewSet, basename='training-session')

urlpatterns = [
    #admin
    path('admin/', admin.site.urls),

    #api
    path('api/', include(router.urls)),
    path('api/user-profile/', views.user_profile, name='user-profile'),
    path('api/user-posts/', views.user_posts, name='user-posts'),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #health
    path('api/health/', lambda request: HttpResponse(status=200), name='health_check'),


    path('auth/', include('dj_rest_auth.urls')),

    #google
    path('auth/google/', include('allauth.socialaccount.urls')),
    path('auth/google/callback/', views.google_callback, name='google_callback'),
    path('auth/google/login/', GoogleLogin.as_view(), name='google_login'),



    path(
        'social-auth/',
        include('social_django.urls', namespace='social')
    ),

    #Telegram things
    path('api/link-telegram/', LinkTelegramView.as_view(), name='link-telegram'),
    path('api/link-telegram/status/', LinkTelegramStatusView.as_view(), name='link-telegram-status'),
    path('api/link-telegram/confirm/', LinkTelegramConfirmView.as_view(), name='link-telegram-confirm'),
    #path('api/training-sessions/', UserTrainingSessionsView.as_view(), name='training-sessions'),
    path('api/user-training-sessions/', UserTrainingSessionsView.as_view(), name='user-training-sessions'),
    #path('', views.index, name='index'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
