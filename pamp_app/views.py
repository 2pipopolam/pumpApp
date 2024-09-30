import os
from django.conf import settings
from django.shortcuts import render,get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Profile, Post
from .serializers import ProfileSerializer, PostSerializer

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


def post_list(request):
    posts = Post.objects.all()
    return render(request, 'pamp_app/post_list.html', {'posts': posts})

def post_detail(request, id):
    post = get_object_or_404(Post, id=id)
    return render(request, 'pamp_app/post_detail.html', {'post': post})


 
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        for image in instance.images.all():
            print(f"Image saved at: {image.image.path}")
            print(f"Image URL: {image.image.url}")
        for video in instance.videos.all():
            print(f"Video saved at: {video.video.path}")
            print(f"Video URL: {video.video.url}")



# class FileUploadView(APIView):
#     parser_classes = (MultiPartParser, FormParser)

#     def post(self, request, *args, **kwargs):
#         file_serializer = FileSerializer(data=request.data)
#         if file_serializer.is_valid():
#             file_serializer.save()
#             return Response(file_serializer.data, status=status.HTTP_201_CREATED)
#         else:
#             return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
def user_profile(request):
    profile = request.user.profile
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['GET'])
def user_posts(request):
    posts = Post.objects.filter(profile=request.user.profile)
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)


# Render React app
def index(request):
    return render(request, 'index.html')




# class PostCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, format=None):
#         serializer = PostSerializer(data=request.data, context={'request': request})
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


