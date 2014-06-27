angular.module('speakerstack.profileService', [])
    .factory('profileService', ['$http', '$upload', 'securityService',
        function ($http, $upload, securityService) {
            return {
                get: function (callback) {
                    $http
                        .get('/api/user/current')
                        .success(function (data) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                },
                update: function (profile, file, onSuccess, onError) {
                    $upload
                        .upload({
                            url: '/api/user/current',
                            method: 'POST',
                            withCredentials: true,
                            data: profile,
                            file: file
                        })
                        .success(function (data, status, headers, config) {
                            onSuccess(data);
                        })
                        .error(function (data, status, headers, config) {
                            if (status == 403) {
                                securityService.redirectUnauthorized();
                            } else {
                                onError(data);
                            }
                        });
                },
                updateImage: function (file, callback) {
                    $upload
                        .upload({
                            url: '/api/user/current/image',
                            method: 'POST',
                            withCredentials: true,
                            file: file
                        })
                        .success(function (data, status, headers, config) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                },
                updateBackground: function (file, callback) {
                    $upload
                        .upload({
                            url: '/api/user/current/background',
                            method: 'POST',
                            withCredentials: true,
                            file: file
                        })
                        .success(function (data, status, headers, config) {
                            callback(data);
                        })
                        .error(securityService.redirectUnauthorized);
                },
                sendMessage: function (userId, message, success, error) {
                    $http({
                        method: "POST",
                        url: '/api/user/send-message',
                        data: {
                            userId: userId,
                            message: message
                        }
                    })
                        .success(success)
                        .error(function (data, status, headers, config) {
                            if (status == 403) {
                                securityService.redirectUnauthorized();
                            } else {
                                error(data);
                            }
                        });
                }
            }
        }]);
