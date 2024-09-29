from django.db import models
#from django.core.validators import FileExtensionValidator
from django.conf import settings
#from .fields import CustomFileField

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
 
    avatar = models.ImageField(
        blank=True,
        upload_to='user_avatars/%Y/%m/%d/',
    )

    def __str__(self):
        return f'Profile of {self.user.username}'

class PostImage(models.Model):
    post = models.ForeignKey('Post', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='post_images/%Y/%m/%d/')

class PostVideo(models.Model):
    post = models.ForeignKey('Post', related_name='videos', on_delete=models.CASCADE)
    video = models.FileField(upload_to='post_videos/%Y/%m/%d/')

class Post(models.Model):
    title = models.CharField(max_length=200)
    training_type = models.CharField(max_length=100)
    description = models.TextField()
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE)

    def __str__(self):
        return self.title





    # photo = models.ImageField(
    #     blank=True,
    #     upload_to='posts/%Y/%m/%d/',
    # )


# class UserTraining(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     date = models.DateField()
#     time = models.TimeField()
#     duration = models.DurationField()
#     description = models.TextField(blank=True)
#     training_type = models.TextField(blank = False)


#     class Meta:
#         ordering = ['date', 'time']

#     def __str__(self):
#         return f'Тренировка {self.user.username} - {self.date} {self.time}'
