from django.urls import path
from . import views

app_name = 'pamp_up'

urlpatterns = [
    #path('post/create/', views.post_create, name='post_create'),
    path('', views.post_list, name='post_list'),
    path('<int:id>/', views.post_detail, name='post_detail'),
]
