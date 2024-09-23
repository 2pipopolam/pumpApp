from rest_framework import serializers
from .models import Profile, Post

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'photo']
        #fields = __all__

class PostSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'profile', 'title', 'training_type', 'description', 'photo', 'video', 'views', 'created_at', 'updated_at']
        #fields = __all__
        read_only_fields = ['views', 'created_at', 'updated_at']
