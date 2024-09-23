from django.contrib import admin
from .models import Profile, Post

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'photo']
    list_filter = ['user']
    search_fields = ['user__username']
    raw_id_fields = ['user']
    ordering = ['user']
    show_facets = admin.ShowFacets.ALWAYS

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'profile', 'training_type', 'created_at', 'views']
    list_filter = ['training_type', 'created_at']
    search_fields = ['title', 'description', 'profile__user__username']
    raw_id_fields = ['profile']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    show_facets = admin.ShowFacets.ALWAYS
