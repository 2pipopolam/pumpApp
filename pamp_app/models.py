from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    photo = models.ImageField(
        blank=True,
        upload_to='users/%Y/%m/%d/',
    )

    def __str__(self):
        return f'Profile of {self.user.username}'


class Post(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    training_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    photo = models.ImageField(
        blank=True,
        upload_to='posts/%Y/%m/%d/',
    )
    video = models.FileField(
        upload_to='videos/%Y/%m/%d/', 
        blank=True, 
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'mov', 'wmv'])]
    )
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} by {self.profile.user.username}'


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
