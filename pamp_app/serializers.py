from rest_framework import serializers
from .models import Post, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'avatar']

class PostSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)


    class Meta:
        model = Post
        fields = ['id', 'title', 'photo', 'photo_url', 'training_type', 'description', 'video', 'views', 'created_at', 'updated_at', 'profile']



    def create(self, validated_data):
        # Получаем профиль пользователя из контекста запроса
        profile = self.context['request'].user.profile
        validated_data['profile'] = profile
        return super().create(validated_data)
    

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
