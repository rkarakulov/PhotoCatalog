catalogApp.controller('photosController', ['$scope', '$routeParams',  '$rootScope', '$location', 'authService',
    function ($scope, $routeParams, $rootScope, $location, authService) {
        var self = {};
        self.params = $routeParams;

        $scope.photos = [];
        $scope.album = authService.getSelectedAlbum(self.params.aid);

        $scope.toAlbums = function(){
            $location.path('/');
        }

        $scope.selectPhoto = function(photo){
            authService.selectPhoto(photo);
            $location.path('/photo/' + self.params.aid + "/" + photo.pid);
        };

        authService.getPhotos(self.params.aid, function(response){
            $scope.apply(function(){
                $scope.photos = response;
            });

            var element = $("#photos")[0];
            $(element).hide();
            // todo blockUI
            imagesLoaded($(element), function(instance) {
                $(element).show();
                // todo blockUI
                $(element).isotope("reLayout");

                $(element).find(".pop-over").each(function(){
                    var $this = $(this);
                    $this.tooltip();
                    $this.bind('mouseover',function(e) {
                        $this.tooltip('show');
                    });
                });
            });

        });
    }
]);




