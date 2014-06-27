var catalogApp = angular.module('catalogApp', [
        'ngRoute',
        'ngAnimate',
        'iso.directives'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home/index.html',
                controller: 'albumsController'
//                resolve: {
//                    products: ['$http', '$q', function($http, $q){
//                        var deferred = $q.defer();
//                        $http.get('data/projects/projects.json').success(function(data) {
//                            deferred.resolve(data);
//                        });
//                        return deferred.promise;
//                    }]
//                }
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'authController'
            })
            .when('/photos/:aid', {
                templateUrl: 'views/home/photos.html',
                controller: 'photosController'
            })
            .when('/photo/:aid/:pid', {
                templateUrl: 'views/home/photo.html',
                controller: 'photoController'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(false);
    })
    .directive('photos', function($http) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {

                imagesLoaded($(element), function(instance) {
                    $(element).isotope("reLayout");
                });

                $(element).find("img").each(function(){
                    var i =0;
                    element.tooltip();
                    $(element).bind('mouseover',function(e) {
                        $http.get("test").success(function(){
                            attr.$set('originalTitle', "Some text "+i++);
                            element.tooltip('show');
                        });
                    });
                });
            }
        }
    })
    .directive('rkPlupload', ['$parse', function ($parse) {
        return {
            restrict: "A",
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                var parent = $(element).parent().get(0);
                parent.id = 'container_' + (Math.random() * 1000).toString().replace('.', '');
                var uploader = new plupload.Uploader({
                    runtimes: 'flash,silverlight,browserplus',
                    browse_button: $(element).attr('id'),
                    container: parent.id,
                    max_file_size: '10mb',
                    url: '/upload',
                    flash_swf_url: '/public/lib/plupload/plupload.flash.swf',
                    silverlight_xap_url: '/public/lib/plupload/plupload.silverlight.xap',
                    filters: [
                        { title: "Image files", extensions: "jpg,jpeg,gif,png" }
                    ]
                });

                uploader.bind('FilesAdded', function (up, files) {
                    setTimeout(function () {
                        up.refresh();
                        up.start();
                    }, 500);
                });

                uploader.bind('FileUploaded', function (up, file, res) {
                    scope.$apply(function () {
                        var photo = res.response;
                        ngModel.$setViewValue(photo);
                    });
                });

                uploader.init();
            }
        };
    }])

//    .directive('ngEnter', function () {
//        return function (scope, element, attrs) {
//            element.bind("keydown keypress", function (event) {
//                if (event.which === 13) {
//                    scope.$apply(function () {
//                        scope.$eval(attrs.ngEnter);
//                    });
//
//                    event.preventDefault();
//                }
//            });
//        };
//    })
//    .filter('pan', function(){
//        return function(text){
//            var pan = text.toString();
//            var firstPart = pan.substring(0, 4);
//            var lastPart = pan.substring(12);
//            return firstPart + '********' + lastPart;
//        }
//    })
    .run(function ($rootScope, $location, authService) {

//        authService.checkLoginStatus(function(){
//            $rootScope.$broadcast('authenticateChecked');
//        });

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (next && !current) {

            }
        });

        angular.extend($rootScope, {
            apply: function (func) {
                if ($rootScope.$$phase)
                    func();
                else
                    $rootScope.$apply(function () {
                        func();
                    });
            }
        });
    });


