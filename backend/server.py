from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import asyncio
import random
from typing import Optional
from datetime import datetime

app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

sessions = {}
sid_to_code = {}
delete_tasks = {}

async def delete_if_empty(code, delay=10):
    await asyncio.sleep(delay)
    if code in sessions and not sessions[code]["devices"]:
        del sessions[code]
    delete_tasks.pop(code, None)

async def add_device(sid, code, name):
    task = delete_tasks.pop(code, None)
    if task:
        task.cancel()
    devices = sessions[code]["devices"]
    for old_sid, n in list(devices.items()):
        if n == name and old_sid != sid:
            devices.pop(old_sid)
            sid_to_code.pop(old_sid, None)
    await sio.enter_room(sid, code)
    devices[sid] = name
    sid_to_code[sid] = code
    await sio.emit("devices_updated", list(devices.values()), room=code)

@sio.event
def connect(sid, environ, auth):
    print('connect ', sid)

@sio.event
async def disconnect(sid, reason):
    code = sid_to_code.pop(sid, None)
    if code and code in sessions:
        sessions[code]["devices"].pop(sid, None)
        if not sessions[code]["devices"]:
            delete_tasks[code] = asyncio.create_task(delete_if_empty(code))
        else:
            await sio.emit("devices_updated", list(sessions[code]["devices"].values()), room=code)

@sio.event
async def create_session(sid, device_name):
    code = str(random.randint(1000, 9999))
    while code in sessions:
        code = str(random.randint(1000, 9999))
    sessions[code] = {"devices": {}, "entries": []}
    await add_device(sid, code, device_name)
    return {"code": code}

@sio.event
async def join_session(sid, code, device_name):
    if code not in sessions:
        return {"ok": False, "error": "Invalid code"}
    await add_device(sid, code, device_name)
    return {"ok": True, "code": code}

@sio.event
async def add_device(sid, code, name):
    await sio.enter_room(sid, code)
    sessions[code]["devices"][sid] = name
    sid_to_code[sid] = code
    await sio.emit("devices_updated", list(sessions[code]["devices"].values()), room=code)

