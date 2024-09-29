from rest_framework import serializers
from .models import Post, Profile , PostImage , PostVideo

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'avatar']


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']

class PostVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostVideo
        fields = ['id', 'video']

class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)
    videos = PostVideoSerializer(many=True, read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'images', 'videos', 'training_type', 'description', 'views', 'created_at', 'updated_at', 'profile']

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        videos_data = self.context['request'].FILES.getlist('videos')
        profile = self.context['request'].user.profile
        post = Post.objects.create(profile=profile, **validated_data)

        for image_data in images_data:
            PostImage.objects.create(post=post, image=image_data)

        for video_data in videos_data:
            PostVideo.objects.create(post=post, video=video_data)

        return post
