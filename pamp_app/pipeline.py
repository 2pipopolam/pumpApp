# pamp_app/pipeline.py
import json
from social_core.pipeline.partial import partial
from rest_framework_simplejwt.tokens import RefreshToken

def generate_jwt_tokens(strategy, details, user, *args, **kwargs):
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        # Добавьте другие поля по необходимости
    }

    # Получаем параметр 'next' из запроса
    next_url = strategy.request.GET.get('next') or '/'

    # Создаём URL для перенаправления с токенами
    redirect_url = f"{next_url}?access={access_token}&refresh={refresh_token}&user={json.dumps(user_data)}"

    return strategy.redirect(redirect_url)

