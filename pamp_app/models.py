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

    video = models.FileField(
        upload_to='videos/%Y/%m/%d/', 
        blank=True, 
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'mov', 'wmv'])]
    )

    training_post = models.TextField(blank = True) 


    def __str__(self):
        return f'Profile of {self.user.username}'


class UserTraining(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    description = models.TextField(blank=True)
    training_type = models.TextField(blank = False)


    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f'Тренировка {self.user.username} - {self.date} {self.time}'
