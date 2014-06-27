catalogApp.controller('uploadController', ['$scope', '$routeParams',  '$rootScope', '$location', 'authService',
    function ($scope, $routeParams, $rootScope, $location, authService) {
        var self = {};

        var albumPromise = authService.getSelectedAlbum(self.params.aid);
        albumPromise.then(function(album){
            $scope.apply(function(){
                $scope.album = album;
            });
        });


    }
]);




