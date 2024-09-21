from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Profile
from .models import UserTraining
from .serializers import YourModelSerializer


class YourModelViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = YourModelSerializer
    permission_classes = [permissions.IsAuthenticated]





@api_view(['GET'])
def some_custom_api_view(request):
    # Ваша логика здесь
    return Response({"message": "This is a custom API view"})







# Если вам нужно отрендерить React-приложение
def index(request):
    return render(request, 'index.html')
