var module = angular.module('speakerstack.resetPasswordControllers', []);
module.controller('resetPasswordController', ['$scope', '$http', '$modal', 'resetPasswordService',
    function ($scope, $http, $modal, resetPasswordService) {
        $scope.init = function (token) {
            $scope.token = token;
        };

        $scope.showResetPasswordRequestModal = function () {
            $modal.open({
                backdrop: 'static',
                templateUrl: '/templates/password/request',
                controller: 'resetPasswordRequestModalController',
                resolve: {}
            });
        }

        $scope.resetPassword = function () {
            $scope.errorMessage = null;
            $scope.isLoading = true;

            resetPasswordService.resetPassword({
                    token: $scope.token,
                    password: $scope.password,
                    confirm: $scope.confirm
                },
                function (data) {
                    $scope.isLoading = false;
                    $scope.isPasswordReseted = true;
                },
                function (data) {
                    $scope.errorMessage = data.error.message;
                    $scope.isLoading = false;
                }
            );

        }
    }
]);

module.controller('resetPasswordRequestModalController', ['$scope', '$modalInstance', 'resetPasswordService',
    function ($scope, $modalInstance, resetPasswordService) {
        $scope.isLoading = false;
        $scope.isRequestSent = false;

        $scope.process = function () {
            $scope.errorMessage = null;
            $scope.isLoading = true;

            resetPasswordService.requestToken($scope.email,
                function (data) {
                    $scope.isLoading = false;
                    $scope.isRequestSent = true;
                },
                function (data) {
                    $scope.errorMessage = data.error.message;
                    $scope.isLoading = false;
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
