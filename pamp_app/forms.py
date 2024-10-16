import requests
from django import forms
from django.core.files.base import ContentFile
from django.utils.text import slugify
from .models import Post
from django.contrib.auth import get_user_model



class PostCreateForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'training_type', 'description', 'photo', 'video']
        widgets = {
            'photo': forms.FileInput(),
            'video': forms.FileInput(),
        }

    def clean_photo(self):
        photo = self.cleaned_data.get('photo')
        if photo:
            valid_extensions = ['jpg', 'jpeg', 'png']
            extension = photo.name.rsplit('.', 1)[1].lower()
            if extension not in valid_extensions:
                raise forms.ValidationError(
                    'The given photo does not match valid image extensions.'
                )
        return photo

    def clean_video(self):
        video = self.cleaned_data.get('video')
        if video:
            valid_extensions = ['mp4', 'avi', 'mov']
            extension = video.name.rsplit('.', 1)[1].lower()
            if extension not in valid_extensions:
                raise forms.ValidationError(
                    'The given video does not match valid video extensions.'
                )
        return video

    def save(self, commit=True):
        post = super().save(commit=False)
        
        if self.cleaned_data.get('photo'):
            photo = self.cleaned_data['photo']
            photo_name = f"{slugify(post.title)}_photo.{photo.name.split('.')[-1]}"
            post.photo.save(photo_name, photo, save=False)
        
        if self.cleaned_data.get('video'):
            video = self.cleaned_data['video']
            video_name = f"{slugify(post.title)}_video.{video.name.split('.')[-1]}"
            post.video.save(video_name, video, save=False)
        
        if commit:
            post.save()
        return post






#Reqistration and login

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)


class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(
        label='Password',
        widget=forms.PasswordInput
    )
    password2 = forms.CharField(
        label='Repeat password',
        widget=forms.PasswordInput
    )

    class Meta:
        model = get_user_model()
        fields = ['username', 'first_name', 'email']

    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password'] != cd['password2']:
            raise forms.ValidationError("Passwords don't match.")
        return cd['password2']

    def clean_email(self):
        data = self.cleaned_data['email']
        if User.objects.filter(email=data).exists():
            raise forms.ValidationError('Email already in use.')
        return data


class UserEditForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ['first_name', 'last_name', 'email']

    def clean_email(self):
        data = self.cleaned_data['email']
        qs = User.objects.exclude(
            id=self.instance.id
        ).filter(
            email=data
        )
        if qs.exists():
            raise forms.ValidationError('Email already in use.')
        return data
