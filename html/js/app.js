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


