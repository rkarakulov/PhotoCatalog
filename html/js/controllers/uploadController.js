catalogApp.controller('uploadController', ['$scope', '$routeParams',  '$rootScope', '$location', 'authService',
    function ($scope, $routeParams, $rootScope, $location, authService) {
        var self = {};
        self.params = $routeParams;

        $scope.album = {};
        $scope.photo = {};

        var albumPromise = authService.getSelectedAlbum(self.params.aid);
        albumPromise.then(function(album){
            $scope.apply(function(){
                $scope.album = album;
            });
        });


        var photoPromise = authService.getSelectedPhoto(self.params.aid, self.params.pid);
        photoPromise.then(function(photo){
            $scope.apply(function(){
                $scope.photo = photo;
            });

            var element = $("#photo")[0];
            $(element).hide();
            // todo blockUI
            imagesLoaded($(element), function(instance) {
                $(element).fadeIn(700);
                // todo blockUI
            });
        });

        $scope.toPhotos = function(){
            $location.path('/photos/' + self.params.aid);
        }
    }
]);




