var speakerStackApp = angular.module('speakerstack.eventSpeakerController', []);
speakerStackApp.controller('eventSpeakerController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {

    $scope.eventId = null;
    $scope.init = function (eventId) {
        $scope.eventId = eventId;
    }

    $scope.upload = function () {
        var modalInstance = $modal.open({
            backdrop: 'static',
            templateUrl: '/views/templates/event/upload-speakers.html',
            controller: 'eventSpeakersUploadModalController',
            resolve: {
                eventId: function () {
                    return $scope.eventId;
                }
            }
        });

        modalInstance.result.then(
            function () {
                //$scope.list();
            }, function () {
            }
        );
    }
}]);


speakerStackApp.controller('eventSpeakersUploadModalController', ['$scope', '$modalInstance', '$fileUploader', 'eventId',
    function ($scope, $modalInstance, $fileUploader, eventId) {
        $scope.eventId = eventId;

        $scope.uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,
            url: '/api/events/' + $scope.eventId + '/upload',
            formData: [
                { eventId: $scope.eventId }
            ],
            filters: [
                function (item) {

                    var allowed = /(spreadsheet)/.test(item.type);
                    if (!$scope.showNotAllowedError) $scope.showNotAllowedError = !allowed;
                    return allowed && this.queue.length == 0;
                }
            ]
        });

        $scope.uploader.bind('completeall', function (event, items) {
            // Show errors if it is nessesary
            if ($scope.errorMessage)
                return;

            $scope.uploader.isUploading = true;
            setTimeout(function() {
                    //$modalInstance.close;
                    window.location.href = '/showorg/' + $scope.eventId;
                },
                1000
            );
        })

        $scope.uploader.bind('error', function (event, xhr, item, response) {
            $scope.uploader.isUploading = false;
            $scope.errorMessage = response.message;
        })

        $scope.hasProgressClass = function (file) {
            return file.progress ? "has-progress" : "";
        }

        $scope.queueNotEmpty = function () {
            return $scope.uploader.queue.length > 0;
        }

        $scope.uploadAll = function () {
            $scope.errorMessage = null;
            $scope.uploader.uploadAll();
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };
    }]);
