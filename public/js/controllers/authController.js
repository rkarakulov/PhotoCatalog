catalogApp.controller('authController', ['$scope', '$rootScope', '$location', 'authService',
    function ($scope, $rootScope, $location, authService) {
        $scope.loaded = false;
        $scope.error = '';
        $scope.success = '';

        var self = {
            toHomePage: function(){
                $scope.apply(function() {
                    $location.path('/');
                });
            }
        };

        $scope.isVkontakte = function(){
            return authService.loginTypeName() == "vk";
        };

        $scope.login = function(){
            authService.login(self.toHomePage);
        };

//        $rootScope.$on('authenticateChecked', function(){
//            if(authService.isAuthenticated())
//                self.toHomePage();
//        });
    }
]);