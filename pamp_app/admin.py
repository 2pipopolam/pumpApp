from django.contrib import admin
from .models import Profile, UserTraining

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user' , 'photo' , 'video' , 'training_post']
    list_filter = ['user' ,'training_post' ,'photo' , 'video']
    search_fields = ['training_post', 'photo' , 'video']
    #prepopulated_fields = {'training_post'}
    raw_id_fields = ['user']
    #date_hierarchy = 'date'
    ordering = ['user', 'training_post']
    show_facets = admin.ShowFacets.ALWAYS


@admin.register(UserTraining)
class UserTrainingAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'time', 'training_type', 'description' , 'duration']
    list_filter = ['user', 'date', 'training_type','duration']
    search_fields = ['user', 'training_type']
    raw_id_fields = ['user']
    date_hierarchy = 'date'
    ordering = ['date', 'time','training_type']
    show_facets = admin.ShowFacets.ALWAYS
