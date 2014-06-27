angular.module('speakerstack.eventSpeakerService', [])
    .factory('eventSpeakerService', ['$http', 'securityService', function ($http, securityService) {
        return {
            upload: function (file, callback) {
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
