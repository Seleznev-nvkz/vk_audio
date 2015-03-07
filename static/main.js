var public_id = null;

var create_playlist = function(type) {
    if (!vk.check()) return;
    var nick = $('input#nick').val();
    vk.type = type;
    $('input[type="button"]').hide();

    VK.Api.call('users.get', {user_ids: nick, fields: 'id'}, function(response){
        if (response.response){
            public_id = response.response[0].uid;
            $.notify({message: 'Waiting'}, {allow_dismiss: false, delay: 5000, type: 'success'});
            switch ($('input[name="method"]:checked').val()) {
                case 'audio':
                    vk.vk_get('audio.get', {owner_id: public_id}, vk.audioHandler);
                    break;
                case 'wall':
                    vk.wallHandler();
                    break;
            }
        } else if (response.error){
            vk.errorHandler(response.error.error_msg);
            $('input[type="button"]').show();
        }
    });
};

var vk = {
     user: null,
     type: 'm3u',
     appID: '4781823',
     appPermissions: 9,

     init: function(){
        VK.init({apiId: vk.appID});
        load();

        function load(){
            VK.Auth.login(authInfo, vk.appPermissions);
            function authInfo(response){
                if(response.session){
                    vk.user = response.session.user;
                    $('input#nick').val((vk.user.domain!="") ? vk.user.domain : vk.user.id);
                } else {
                    $.notify({message: 'Auth failed!'}, {allow_dismiss: false, delay: 5000, type: 'danger'});
                }
            }
        }
     },

    check: function() {
        if (vk.user == null) {
            $.notify({message: 'Need to allow access'}, {allow_dismiss: false, delay: 2000, type: 'success'});
            vk.init();
        } else return true
    },

    errorHandler: function(msg) {
        $.notify({message: msg}, {allow_dismiss: false, delay: 5000, type: 'danger'});
    },

    vk_get: function(request, params, callback) {
        VK.Api.call(request, params, function(response){
            if (response.response){
                callback(response.response);
            } else if (response.error){
                $.notify({message: response.error.error_msg}, {allow_dismiss: false, delay: 5000, type: 'danger'});
            }
        })
    },

    audioHandler: function(items) {
        items.shift();
        vk.ajaxCall(JSON.stringify(items));
    },

    wallHandler: function() {
        var data = [],
            offset = 0;

        function getWall(off) {
            vk.vk_get('wall.get', {owner_id: public_id, count: 100, offset: off}, function(response){
                parser(response);
                if (response.length > 100) {
                    offset += 100;
                    getWall(offset)
                } else {
                    vk.ajaxCall(JSON.stringify(data));
                }
            });
        }

        function parser(items){
            for (var i=1, i_len=items.length; i<i_len; i++) {
                var cur_items = items[i].attachments;
                if (cur_items && cur_items.length > 0) {
                    for (var j=1, j_len=cur_items.length; j<j_len; j++) {
                        if (cur_items[j].audio) {data.push(cur_items[j].audio)}
                    }
                }
            }
        }

        getWall(offset);
    },

    ajaxCall: function(items) {
        $.ajax({
            type: 'POST',
            url: '/playlist',
            data: {nick: $('input#nick').val(), type: vk.type, method: $('input[name="method"]:checked').val(), items: items},
            success: function(response) {
                $('input[type="button"]').show();
                if (response.ok) {
                    var a = document.getElementById(vk.type);
                    a.href = response.path;
                    a.click();
                } else {
                    $.notify({message: response.error}, {allow_dismiss: false, delay: 5000, type: 'danger'});
                }
            },
            error: function(){
                $('input[type="button"]').show();
            }
        })
    }
    };

$(document).ready(vk.init());