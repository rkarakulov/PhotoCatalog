catalogApp.factory('authService', ['$q',
    function ($q) {

    var self = {
        isAuthenticated: null,
        vkontakte: {
            session: {},
            name: "vk",
            appId: "4422652",
            album: null,
            init: function(){
                VK.init({apiId: self.vkontakte.appId});
            },
            login: function(callback){
                VK.Auth.login(function(response) {
                    if (response.session) {
                        /* Пользователь успешно авторизовался */
                        self.isAuthenticated = true;
                        self.vkontakte.session = response.session;
                        if(callback)
                            callback();

                        //if (response.settings) {
                        /* Выбранные настройки доступа пользователя, если они были запрошены */
                        //}
                    } else {
                        /* Пользователь нажал кнопку Отмена в окне авторизации */
                    }
                }, 4);


//                Название	Описание
//                notify
//                (+1)	Пользователь разрешил отправлять ему уведомления.
//                    friends
//                (+2)	Доступ к друзьям.
//                    photos
//                (+4)	Доступ к фотографиям.
//                    audio
//                (+8)	Доступ к аудиозаписям.
//                    video
//                (+16)	Доступ к видеозаписям.
//                    docs
//                (+131072)	Доступ к документам.
//                    notes
//                (+2048)	Доступ к заметкам пользователя.
//                    pages
//                (+128)	Доступ к wiki-страницам.
//                +256	Добавление ссылки на приложение в меню слева.
//                    status
//                (+1024)	Доступ к статусу пользователя.
//                    offers
//                (+32)	Доступ к предложениям (устаревшие методы).
//                questions
//                (+64)	Доступ к вопросам (устаревшие методы).
//                wall
//                (+8192)	Доступ к обычным и расширенным методам работы со стеной.
//                    Внимание, данное право доступа недоступно для сайтов (игнорируется при попытке авторизации).
//                groups
//                (+262144)	Доступ к группам пользователя.
//                    messages
//                (+4096)	(для Standalone-приложений) Доступ к расширенным методам работы с сообщениями.
//                    email
//                (+4194304)	Доступ к email пользователя. Доступно только для сайтов.
//                    notifications
//                (+524288)	Доступ к оповещениям об ответах пользователю.
//                    stats
//                (+1048576)	Доступ к статистике групп и приложений пользователя, администратором которых он является.
//                    ads
//                (+32768)	Доступ к расширенным методам работы с рекламным API.
//                    offline
//                (+65536)	Доступ к API в любое время со стороннего сервера (при использовании этой опции параметр expires_in, возвращаемый вместе с access_token, содержит 0 — токен бессрочный).
//                nohttps	Возможность осуществлять запросы к API без HTTPS.
            },
            logout: function (callback) {
                VK.Auth.logout(function(response) {
                    self.isAuthenticated = false;
                    self.vkontakte.session = {};
                    if(callback)
                        callback();
                });
            },
            checkLoginStatus: function(authCallback, notAuthCallback){
                VK.Auth.getLoginStatus(function(response) {
                    if (response.session) {
                        /* Авторизованный в Open API пользователь */
                        self.isAuthenticated = true;
                        self.vkontakte.session = response.session;
                        if(authCallback)
                            authCallback();
                    } else {
                        /* Неавторизованный в Open API пользователь */
                        self.isAuthenticated = false;
                        self.vkontakte.session = {};
                        if(notAuthCallback)
                            notAuthCallback();
                    }
                }, true);
            },
            getUser: function(){
                var deferred = $q.defer();
                if(!self.loginType.session.user){
                    self.loginType.checkLoginStatus(function(){
                        deferred.resolve(self.vkontakte.session.user);
                    }, function(){
                        deferred.resolve(self.vkontakte.session.user);
                    });
                }
                else{
                    deferred.resolve(self.vkontakte.session.user);
                }
                return deferred.promise;
            },
            getPhotoAlbums: function(callback){
                VK.api('photos.getAlbums', {need_covers: 1},function(data) {
                    if (data.response) {
                        if(callback)
                            callback(data.response);
                    }
                });
            },
            getPhotoAlbum: function(aid, callback){
                VK.api('photos.getAlbums', {aids: aid},function(data) {
                    if (data.response) {
                        if(callback)
                            callback(data.response[0]);
                    }
                });
            },
            getPhoto: function(aid, pid, callback){
                VK.api('photos.get', {uid: self.vkontakte.getUser().id, aid: aid, pids: pid},function(data) {
                    if (data.response) {
                        if(callback)
                            callback(data.response[0]);
                    }
                });
            },
            getPhotos: function(aid, callback){
                VK.api('photos.get', {uid: self.vkontakte.getUser().id, aid: aid},function(data) {
                    if (data.response) {
                        if(callback)
                            callback(data.response);
                    }
                });
            }
        }
    };

    self.loginType = self.vkontakte;
    self.loginType.init();

    return {
        loginTypeName: function () {
            return self.loginType.name;
        },
        login: function (successAuth) {
            self.loginType.login(successAuth);
        },
        logout: function (successAuth) {
            self.loginType.logout(successAuth);
        },
        checkLoginStatus: function(authCallback, notAuthCallback) {
            self.loginType.checkLoginStatus(authCallback, notAuthCallback);
        },
        isAuthenticated: function () {
            return !!self.loginType.getUser();
        },
        getUser: function(){
            return self.loginType.getUser();
        },
        getSession: function(){
            return self.loginType.session;
        },
        getPhotoAlbums: function(callback){
            self.loginType.getPhotoAlbums(callback);
        },
        getPhoto: function(aid, pid, callback){
            self.loginType.getPhoto(aid, pid, callback);
        },
        getPhotos: function(aid, callback){
            self.loginType.getPhotos(aid, callback);
        },
        selectAlbum: function(album){
            self.loginType.album = album;
        },
        getSelectedAlbum: function(aid){
            var deferred = $q.defer();
            if(!self.loginType.album){
                self.loginType.getPhotoAlbum(aid, function(album){
                    deferred.resolve(album);
                }, function(){
                    deferred.resolve(album);
                });
            }
            else{
                deferred.resolve(self.loginType.album);
            }
            return deferred.promise;
        },
        clearAlbum: function(album){
            self.loginType.album = null;
        },
        selectPhoto: function(photo){
            self.loginType.photo = photo;
        },
        getSelectedPhoto: function(aid, pid){
            var deferred = $q.defer();
            if(!self.loginType.photo){
                self.loginType.getPhoto(aid, pid, function(photo){
                    deferred.resolve(photo);
                }, function(photo){
                    deferred.resolve(photo);
                });
            }
            else{
                deferred.resolve(self.loginType.photo);
            }
            return deferred.promise;
        },
        clearPhoto: function(album){
            self.loginType.photo = null;
        }
    };
}])