angular.module('speakerstack.sessionService', [])
    .factory('sessionService', ['$http', 'securityService', function ($http, securityService) {
        return {
            list: function (callback) {
                $http({
                    method: "GET",
                    url: "/api/session"
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized);
            },
            remove: function (session, callback) {
                $http({
                    method: "DELETE",
                    url: "/api/session/" + session._id
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized)
            },
            createOrUpdate: function (session, callback) {
                var isNew = !session._id;
                var url = '/api/session' + (isNew ? '' : "/" + session._id );
                $http({
                    method: "POST",
                    url: url,
                    data: session
                }).success(function (data) {
                        callback(data, isNew);
                    }).error(securityService.redirectUnauthorized);
            }
        }
    }]);
