import os
import json
from google.appengine.api import files

current_dir = os.path.dirname(os.path.abspath(__file__))
dir_path = os.path.join(current_dir, 'playlists')

get_class = lambda name: getattr(__import__('vk_handler', fromlist=[name]), name, None)


def playlist_handler(pl_type, uid, method, items_str):
    try:
        name = 'Playlist%s' % str(pl_type).upper()
        current_class = get_class(name)
    except:
        raise ImportError('Wrong playlist type')
    items = json.loads(items_str) or []
    return current_class(uid=uid, method=method, items=items).file_name


class AbsPlaylist(object):

    file_type = ''
    mime_type = ''

    def __init__(self, uid, method):
        self.file_name = ''.join((uid, '_%s' % method, self.file_type))
        self.file = files.gs.create(os.path.join('/gs/vk-audio/', self.file_name),
                                    cache_control='public, max-age=600, no-transform',
                                    mime_type=self.mime_type,
                                    acl='public_read')
        self.response_file = files.open(self.file, 'a')


class PlaylistM3U(AbsPlaylist):

    file_type = '.m3u'
    mime_type = 'audio/x-mpegurl'

    def __init__(self, uid, method, items):
        super(PlaylistM3U, self).__init__(uid, method)
        self.response_file.write('#EXTM3U\n\n')
        for item in items:
            self.response_file.write('#EXTINF:-1,%s - %s \n' % (item.get('artist'), item.get('title')))
            self.response_file.write('%s\n\n' % item.get('url'))
        self.response_file.close()
        files.finalize(self.file)


class PlaylistPLS(AbsPlaylist):

    file_type = '.pls'
    mime_type = 'audio/x-scpls'

    def __init__(self, uid, method, items):
        super(PlaylistPLS, self).__init__(uid, method)
        self.response_file.write('[playlist]\n')
        self.response_file.write('NumberOfEntries=%s\n' % len(items))
        for i, item in enumerate(items, start=1):
            self.response_file.write('File%s=%s\n' % (i, item.get('url')))
            self.response_file.write('Title%s=%s - %s\nLength%s=-1\n' % (i, item.get('artist'), item.get('title'), i))
        self.response_file.close()
        files.finalize(self.file)