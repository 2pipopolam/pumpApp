from django.db import models

class CustomFileField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 255
        super().__init__(*args, **kwargs)
