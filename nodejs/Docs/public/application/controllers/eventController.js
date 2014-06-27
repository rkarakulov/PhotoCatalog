var speakerStackApp = angular.module('speakerstack.eventController', []);
speakerStackApp.controller('eventController', ['$scope', '$http', '$modal', function($scope, $http, $modal){
    $scope.currentDate = new Date();

    $scope.showModal = function(event){
        $modal.open({
            backdrop: 'static',
            templateUrl: '/views/templates/event/create-event.html',
            controller: 'eventEditorModalController',
            resolve: {
                event: function () {
                    return event;
                }
            }
        });
    }

    $scope.add = function(){
        $scope.showModal({});
    }

    $scope.update = function(event){
        $scope.showModal(event);
    }
}]);


speakerStackApp.controller('eventEditorModalController', ['$scope', '$modalInstance', '$location', 'eventService', 'event',
    function ($scope, $modalInstance, $location, eventService, event) {
    $scope.event = angular.copy(event);

    $scope.update = function () {
        eventService.createOrUpdate($scope.event, function(){
            $modalInstance.close($scope.event);
            window.location.href = '/showorg';
        });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);