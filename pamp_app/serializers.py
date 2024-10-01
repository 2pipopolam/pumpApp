# serializers.py
from rest_framework import serializers
from .models import Post, Profile, PostImage, PostVideo, TrainingSession

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'username', 'avatar']

    def update(self, instance, validated_data):
        avatar = validated_data.get('avatar', None)
        if avatar == '':
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = None
        elif avatar is not None:
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = avatar

        instance.save()
        return instance





class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'image_url']

    def validate(self, data):
        if not data.get('image') and not data.get('image_url'):
            raise serializers.ValidationError("Either image file or image URL must be provided.")
        return data

class PostVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostVideo
        fields = ['id', 'video', 'video_url']

    def validate(self, data):
        if not data.get('video') and not data.get('video_url'):
            raise serializers.ValidationError("Either video file or video URL must be provided.")
        return data





class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = ['id', 'date', 'time', 'recurrence', 'days_of_week']

    def create(self, validated_data):
        profile = self.context['request'].user.profile
        return TrainingSession.objects.create(profile=profile, **validated_data)




class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, required=False)
    videos = PostVideoSerializer(many=True, required=False)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'images', 'videos', 'training_type', 'description', 'views', 'created_at', 'updated_at', 'profile']

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        images_url_data = self.context['request'].data.getlist('image_urls')
        videos_data = self.context['request'].FILES.getlist('videos')
        videos_url_data = self.context['request'].data.getlist('video_urls')

        profile = self.context['request'].user.profile
        post = Post.objects.create(profile=profile, **validated_data)

        # Обработка файлов изображений
        for image_data in images_data:
            PostImage.objects.create(post=post, image=image_data)

        # Обработка URL изображений
        for image_url in images_url_data:
            PostImage.objects.create(post=post, image_url=image_url)

        # Обработка файлов видео
        for video_data in videos_data:
            PostVideo.objects.create(post=post, video=video_data)

        # Обработка URL видео
        for video_url in videos_url_data:
            PostVideo.objects.create(post=post, video_url=video_url)

        return post

    def update(self, instance, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        images_url_data = self.context['request'].data.getlist('image_urls')
        videos_data = self.context['request'].FILES.getlist('videos')
        videos_url_data = self.context['request'].data.getlist('video_urls')

        existing_image_ids = self.context['request'].data.getlist('existing_images')
        existing_video_ids = self.context['request'].data.getlist('existing_videos')

        instance.title = validated_data.get('title', instance.title)
        instance.training_type = validated_data.get('training_type', instance.training_type)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Обновление изображений
        if existing_image_ids:
            instance.images.exclude(id__in=existing_image_ids).delete()
        else:
            instance.images.all().delete()

        for image_data in images_data:
            PostImage.objects.create(post=instance, image=image_data)

        for image_url in images_url_data:
            PostImage.objects.create(post=instance, image_url=image_url)

        # Обновление видео
        if existing_video_ids:
            instance.videos.exclude(id__in=existing_video_ids).delete()
        else:
            instance.videos.all().delete()

        for video_data in videos_data:
            PostVideo.objects.create(post=instance, video=video_data)

        for video_url in videos_url_data:
            PostVideo.objects.create(post=instance, video_url=video_url)

        return instance
