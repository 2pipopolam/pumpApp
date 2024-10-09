from django.shortcuts import render,get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view , action , permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_api_key.permissions import HasAPIKey
from .models import Profile, Post,TrainingSession,TelegramLink


from rest_framework.views import APIView
import uuid
import logging
from django.utils import timezone
from django.contrib.auth.models import User



#from datetime import timedelta
#import os
#from django.urls import path
#from rest_framework.permissions import IsAuthenticated
#import os
#from django.conf import settings
#from rest_framework.parsers import MultiPartParser, FormParser
#from rest_framework import status


from .serializers import (
    ProfileSerializer,
    PostSerializer,
    TrainingSessionSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    GoogleLoginSerializer
)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

logger = logging.getLogger(__name__)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000"  # URL React
    client_class = OAuth2Client
    serializer_class = GoogleLoginSerializer

    def get_response(self):
        response = super().get_response()
        return response


@csrf_exempt
def google_callback(request):
    return JsonResponse({'message': 'Authentication successful'})



class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

   
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(profile, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)




class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        for image in instance.images.all():
            if image.image:
                print(f"Image saved at: {image.image.path}")
                print(f"Image URL: {image.image.url}")
            elif image.image_url:
                print(f"Image URL: {image.image_url}")
            else:
                print("No image file or URL provided.")

        for video in instance.videos.all():
            if video.video:
                print(f"Video saved at: {video.video.path}")
                print(f"Video URL: {video.video.url}")
            elif video.video_url:
                print(f"Video URL: {video.video_url}")
            else:
                print("No video file or URL provided.")
 
    def get_queryset(self):
        return Post.objects.filter(profile__user=self.request.user)



def post_list(request):
    posts = Post.objects.all()
    return render(request, 'pamp_app/post_list.html', {'posts': posts})

def post_detail(request, id):
    post = get_object_or_404(Post, id=id)
    return render(request, 'pamp_app/post_detail.html', {'post': post})


#class TrainingSessionViewSet(viewsets.ModelViewSet):
    #serializer_class = TrainingSessionSerializer
    #permission_classes = [permissions.IsAuthenticated]

    #def get_queryset(self):
        #return TrainingSession.objects.filter(profile=self.request.user.profile)
    
    
#class TrainingSessionListView(APIView):
    # permission_classes = [HasAPIKey]

    # def get(self, request):
    #     user_id = request.query_params.get('id')
    #     if not user_id:
    #         return Response({"detail": "id обязателен."}, status=status.HTTP_400_BAD_REQUEST)
    #     try:
    #         user = User.objects.get(id=user_id)
    #     except User.DoesNotExist:
    #         return Response({"detail": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)
    #     
    #     now = timezone.now().date()
    #     sessions = TrainingSession.objects.filter(profile__user=user, date__gte=now).order_by('date')
    #     serializer = TrainingSessionSerializer(sessions, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

#     
# class TrainingSessionViewSet(ModelViewSet):
#     queryset = TrainingSession.objects.all()
#     serializer_class = TrainingSessionSerializer
#     permission_classes = [HasAPIKey]





class TrainingSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrainingSession.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)





@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Неверные учетные данные.'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    profile = request.user.profile
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ProfileSerializer(profile, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def user_posts(request):
    posts = Post.objects.filter(profile=request.user.profile)
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)




#Telegram things
class LinkTelegramView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        link, created = TelegramLink.objects.get_or_create(user=user)
        if link.telegram_user_id:
            logger.info(f"Пользователь {user.id} уже связан с Telegram.")
            return Response({"detail": "Telegram уже связан."}, status=status.HTTP_400_BAD_REQUEST)
        link.linking_code = uuid.uuid4()
        link.save()
        logger.info(f"Сгенерирован код связывания для пользователя {user.id}: {link.linking_code}")
        return Response({"code": str(link.linking_code)}, status=status.HTTP_200_OK)



class LinkTelegramStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            link = TelegramLink.objects.get(user=user)
            if link.telegram_user_id:
                return Response({"linked": True}, status=status.HTTP_200_OK)
            elif link.is_expired():
                return Response({"linked": False, "status": "expired"}, status=status.HTTP_200_OK)
            else:
                return Response({"linked": False, "status": "pending"}, status=status.HTTP_200_OK)
        except TelegramLink.DoesNotExist:
            return Response({"linked": False, "status": "no_link"}, status=status.HTTP_200_OK)



class LinkTelegramConfirmView(APIView):
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        code = request.data.get('code')
        telegram_user_id = request.data.get('telegram_user_id')

        if not code or not telegram_user_id:
            logger.warning("Запрос без кода или telegram_user_id.")
            return Response({"detail": "Код и telegram_user_id обязательны."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            link = TelegramLink.objects.get(linking_code=code)
            if link.is_expired():
                logger.warning(f"Код {code} истёк.")
                return Response({"detail": "Код истёк."}, status=status.HTTP_400_BAD_REQUEST)
            link.telegram_user_id = telegram_user_id
            link.linking_code = None  # Сбрасываем код после связывания
            link.save()
            logger.info(f"Пользователь {link.user.id} успешно связан с Telegram ID {telegram_user_id}.")
            return Response({"detail": "Telegram успешно связан.", "user_id": link.user.id}, status=status.HTTP_200_OK)
        except TelegramLink.DoesNotExist:
            logger.warning(f"Неверный код связывания: {code}")
            return Response({"detail": "Неверный код."}, status=status.HTTP_400_BAD_REQUEST)



# class UserTrainingSessionsView(APIView):
#     permission_classes = [HasAPIKey]

#     def get(self, request):
#         user_id = request.query_params.get('id')  # Ожидаем параметр 'id'

#         if not user_id:
#             return Response({"detail": "id обязателен."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return Response({"detail": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)

#         now = timezone.now().date()
#         sessions = TrainingSession.objects.filter(profile__user=user, date__gte=now).order_by('date')

#         serializer = TrainingSessionSerializer(sessions, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)



class UserTrainingSessionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get('id')

        if not user_id:
            return Response({"detail": "id обязателен."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now().date()
        sessions = TrainingSession.objects.filter(profile__user=user, date__gte=now).order_by('date')

        serializer = TrainingSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)





# Render React app
# def index(request):
    #return render(request, 'index.html')
