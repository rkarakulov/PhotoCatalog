angular.module('speakerstack.eventService', [])
    .factory('eventService', ['$http', 'securityService', function ($http, securityService) {
        return {
            list: function (callback) {
                $http({
                    method: "GET",
                    url: "/api/events"
                })
                    .success(callback)
                    .error(securityService.redirectUnauthorized);
            },
            createOrUpdate: function (event, callback) {
                var isNew = !event._id;
                var url = '/api/events' + (isNew ? '' : "/" + event._id );
                $http({
                    method: "POST",
                    url: url,
                    data: event
                }).success(callback)
                    .error(securityService.redirectUnauthorized);
            }
        }
    }]);