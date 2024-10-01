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


# class FileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = File
#         fields = "__all__"




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

    def update(self, instance, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        videos_data = self.context['request'].FILES.getlist('videos')
        existing_image_ids = self.context['request'].data.getlist('existing_images')
        existing_video_ids = self.context['request'].data.getlist('existing_videos')

        instance.title = validated_data.get('title', instance.title)
        instance.training_type = validated_data.get('training_type', instance.training_type)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Удаляем изображения, которых нет в existing_image_ids
        if existing_image_ids:
            instance.images.exclude(id__in=existing_image_ids).delete()
        else:
            instance.images.all().delete()

        # Добавляем новые изображения
        for image_data in images_data:
            PostImage.objects.create(post=instance, image=image_data)

        # То же для видео
        if existing_video_ids:
            instance.videos.exclude(id__in=existing_video_ids).delete()
        else:
            instance.videos.all().delete()

        for video_data in videos_data:
            PostVideo.objects.create(post=instance, video=video_data)

        return instance

