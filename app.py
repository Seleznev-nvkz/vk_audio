# -*- coding: utf-8 -*-
from bottle import template, request, Bottle, BaseRequest
from vk_handler import playlist_handler


bottle = Bottle()
BaseRequest.MEMFILE_MAX = 1024*1024*10


@bottle.route('/')
def index():
    return template('index.html')


@bottle.post('/playlist')
def ajax_handler():
    nick = request.forms.get("nick")
    playlist_type = request.forms.get("type", 'm3u')
    method = request.forms.get("method", 'audio').lower()
    items = request.forms.get("items", '')
    print request.forms
    if nick:
        file_name = playlist_handler(pl_type=playlist_type, uid=nick, method=method, items_str=items)
        return {'ok': True, 'path': 'https://vk-audio.storage.googleapis.com/%s' % file_name}
    else:
        return {'ok': False, 'error': 'Not found nickname or uId'}