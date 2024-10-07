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


from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from pamp_app import views

from pamp_app.views import GoogleLogin

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

#from pamp_app.views import FileUploadView


router = DefaultRouter()
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'posts', views.PostViewSet)  # If PostViewSet has a queryset, no need to specify basename
router.register(r'training-sessions', views.TrainingSessionViewSet, basename='training-session')

urlpatterns = [
    path('admin/', admin.site.urls),     
    path('api/', include(router.urls)),
    path('api/user-profile/', views.user_profile, name='user-profile'),
    path('api/user-posts/', views.user_posts, name='user-posts'),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/google/', include('allauth.socialaccount.urls')),
    path('auth/google/callback/', views.google_callback, name='google_callback'),

    path('auth/google/login/', GoogleLogin.as_view(), name='google_login'),



    path(
        'social-auth/',
        include('social_django.urls', namespace='social')
    ),

    path('', views.index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
