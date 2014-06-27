catalogApp.controller('menuController', ['$scope', '$rootScope', '$location', 'authService',
    function ($scope, $rootScope, $location, authService) {

        $scope.isAuthenticated = function(){
            return authService.isAuthenticated();
        };

        $scope.logout = function(){
            authService.logout(
                function() {
                    $scope.apply(function () {
                        $location.path('/login');
                    });
                });
        };

        $rootScope.$on('authenticateChecked', function(){
            $scope.apply(function () {
            });
        });
    }
]);
