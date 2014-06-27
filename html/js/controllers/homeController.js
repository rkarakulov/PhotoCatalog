catalogApp.controller('homeController', ['$scope', '$rootScope', '$location', 'authService',
    function ($scope, $rootScope, $location, authService) {

        $scope.loading = false;
        $scope.loaded = false;

//        $rootScope.$on('authenticateChecked', function(){
//            if(!authService.isAuthenticated()) {
//                $scope.apply(function () {
//                    $location.path('/login');
//                });
//            }
//        });
    }
]);

