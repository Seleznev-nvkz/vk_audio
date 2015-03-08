# WebApp on Bottle mirco-framework with Google App Engine and Google Cloud Storage

Simple website to create .m3u/.pls playlists with music from Vk.com ('my music' or posts on wall). Building with the 
[Bottle micro framework](http://bottlepy.org)  version 0.12.8

# To Deploy

1. Install the [App Engine Python SDK](https://developers.google.com/appengine/downloads). See the README file for directions. You'll need python 2.7 and [pip 1.4 or later](http://www.pip-installer.org/en/latest/installing.html) installed too.

2. Clone this repository with
```sh
    git clone https://github.com/Seleznev-nvkz/vk_audio.git
```
3. Install dependencies in the project's `lib/` directory. Note: App Engine can only import libraries from inside your project directory.
```
    pip install -r requirements.txt -t lib/
```

4. Use the [Admin Console](https://appengine.google.com) to create an app and
   get the project/app id. (App id and project id are identical)
5. [Deploy the
   application](https://developers.google.com/appengine/docs/python/tools/uploadinganapp) with
```
    appcfg.py -A <your-project-id> --oauth2 update <path-to-project>
```
6. Enable billing to the [Google Developers Console](https://console.developers.google.com/).
7. Add bucket in [Google Developers Console](https://console.developers.google.com/) (to access with API use path `/gs/<bucket-name>/`). For example
```
from google.appengine.api import files
files.gs.create('/gs/vk-audio/', cache_control='public, max-age=600, no-transform',
                                    mime_type='text/html',
                                    acl='public_read')
```
8. Congratulations! Application is now live at project-id.appspot.com


### Tech
Used this in project:
* [VK API](https://vk.com/dev/openapi) - to get informations about songs
* [jQuery](http://jquery.com) - to form and send this to the server with ajax
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) - UI boilerplate for modern web apps
* [Bottle](http://bottlepy.org) - micro-framework for using python app
* [Google App Engine](https://appengine.google.com/) - to hosting website
* [Google Cloud Platform](https://cloud.google.com/storage/) - to storage created playlists

