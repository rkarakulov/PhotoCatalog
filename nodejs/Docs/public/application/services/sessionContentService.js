angular.module('speakerstack.sessionContentService', [])
    .factory('sessionContentService', ['$http', 'securityService', function ($http, securityService) {
        return {
            list: function (session, callback) {
                $http({
                    method: "GET",
                    url: "/api/session-content",
                    params: {sessionId: session._id}
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized);
            },
            remove: function (sessionContent, callback) {
                $http({
                    method: "DELETE",
                    url: "/api/session-content/" + sessionContent._id
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized)
            },
            updateProtectStatus: function (sessionContent, callback) {
                $http({
                    method: "POST",
                    url: "/api/session-content/" + sessionContent._id,
                    data: {
                        isProtected: sessionContent.isProtected
                    }
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized)
            }
        }
    }]);
