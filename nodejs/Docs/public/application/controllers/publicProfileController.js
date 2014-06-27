var speakerStackApp = angular.module('speakerstack.publicProfileController', []);
speakerStackApp.controller('publicProfileController', ['$scope', '$http', '$modal',
    function ($scope, $http, $modal) {

        $scope.init = function (userId) {
            $scope.userId = userId;
        };

        $scope.showContactModal = function () {
            $modal.open({
                backdrop: 'static',
                templateUrl: 'templates/profile/contact',
                controller: 'contactModalController',
                resolve: {
                    userId: function () {
                        return $scope.userId;
                    }
                }
            });
        }

    }
]);

speakerStackApp.controller('contactModalController', ['$scope', '$modalInstance', 'profileService', 'userId',
    function ($scope, $modalInstance, profileService, userId) {
        $scope.userId = userId;

        $scope.send = function () {
            if (!$scope.messageText) return;

            $scope.isLoading = true;
            $scope.isMessageSent = false;

            profileService.sendMessage($scope.userId, $scope.messageText,
                function (data) {
                    $scope.isLoading = false;
                    $scope.isMessageSent = true;
                }, function (data) {
                    $scope.isLoading = false;
                    $scope.errorMessage = response.message;
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
