# chat/middleware.py
import json
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Read access_token from cookies
        headers = dict(scope["headers"])
        cookie_header = headers.get(b"cookie", b"").decode()
        print("🍪 COOKIE HEADER:", cookie_header)
        
        access_token = None
        if cookie_header:
            cookies = dict(c.split('=', 1) for c in cookie_header.split('; ') if '=' in c)
            access_token = cookies.get('access_token')
            print("🔑 ACCESS TOKEN:", access_token)
        
        # Validate JWT from cookie
        if access_token:
            try:
                # Decode and validate token
                token = AccessToken(access_token)
                user_id = await self.get_user(token["user_id"])
                scope["user"] = user_id
            except (InvalidToken, TokenError, KeyError):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
            
        return await self.inner(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
