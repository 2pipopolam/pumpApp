# serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Profile, PostImage, PostVideo, TrainingSession

from allauth.socialaccount.helpers import complete_social_login
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.models import SocialLogin, SocialToken, SocialApp
#from django.conf import settings
#from dj_rest_auth.registration.serializers import SocialLoginSerializer
#import traceback


#Login
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirm password')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})



#Profile
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user = UserSerializer(read_only=True)  # Сделать user только для чтения

    class Meta:
        model = Profile
        fields = ['id', 'user', 'username', 'avatar']



    def update(self, instance, validated_data):
        avatar = validated_data.get('avatar', None)
        if avatar == '':
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = None
        elif avatar:
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



# class TrainingSessionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TrainingSession
#         fields = ['id', 'date', 'time', 'recurrence', 'days_of_week']

#     def create(self, validated_data):
#         profile = self.context['request'].user.profile
#         return TrainingSession.objects.create(profile=profile, **validated_data)


class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = ['id', 'date', 'time', 'recurrence', 'days_of_week', 'profile']
        read_only_fields = ('profile',)





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


        for image_data in images_data:
            PostImage.objects.create(post=post, image=image_data)

        for image_url in images_url_data:
            PostImage.objects.create(post=post, image_url=image_url)

        for video_data in videos_data:
            PostVideo.objects.create(post=post, video=video_data)

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

        if existing_image_ids:
            instance.images.exclude(id__in=existing_image_ids).delete()
        else:
            instance.images.all().delete()

        for image_data in images_data:
            PostImage.objects.create(post=instance, image=image_data)

        for image_url in images_url_data:
            PostImage.objects.create(post=instance, image_url=image_url)

        if existing_video_ids:
            instance.videos.exclude(id__in=existing_video_ids).delete()
        else:
            instance.videos.all().delete()

        for video_data in videos_data:
            PostVideo.objects.create(post=instance, video=video_data)

        for video_url in videos_url_data:
            PostVideo.objects.create(post=instance, video_url=video_url)

        return instance





class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True, allow_blank=False)

    def validate(self, attrs):
        request = self.context['request']
        id_token = attrs.get('id_token')
        adapter = GoogleOAuth2Adapter(request)
 
        try:
            app = SocialApp.objects.get(provider=adapter.provider_id)
        except SocialApp.DoesNotExist:
            raise serializers.ValidationError('SocialApp for Google provider is not configured.')

        token = SocialToken(app=app, token=id_token)

        try:
            login = adapter.complete_login(request, app, token, response={'id_token': id_token})
            login.token = token
            login.state = SocialLogin.state_from_request(request)

            complete_social_login(request, login)

            if not login.user.pk:
                login.user.save()

            if not login.is_existing:
                login.save(request, connect=True)

        except Exception as e:
            import traceback
            traceback_str = ''.join(traceback.format_tb(e.__traceback__))
            raise serializers.ValidationError({
                'detail': f'Failed to login with Google: {str(e)}',
                'traceback': traceback_str
            })

        attrs['user'] = login.user
        return attrs
