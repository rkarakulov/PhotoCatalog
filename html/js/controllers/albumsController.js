catalogApp.controller('albumsController', ['$scope', '$rootScope', '$location', 'authService',
    function ($scope, $rootScope, $location, authService) {

        $scope.albums = [];

        $scope.selectAlbum = function(album){
            authService.selectAlbum(album);
            $location.path('/photos/'+album.aid);
        }

        if(!authService.isAuthenticated())
        {
           $scope.apply(function () {
                $location.path('/login');
            });
        }
        else {
            authService.getPhotoAlbums(function (response) {
                $scope.apply(function(){
                    $scope.albums = response;
                });
            });
        }
    }
]);




