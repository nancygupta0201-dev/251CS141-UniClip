from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import random
from typing import Optional
from datetime import datetime

app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

@sio.event
def connect(sid, environ, auth):
    print('connect ', sid)

@sio.event
def disconnect(sid, reason):
    print('disconnect ', sid, reason)

@sio.event
async def test_event(sid, data):
    await sio.emit('test_reply', data, to=sid)