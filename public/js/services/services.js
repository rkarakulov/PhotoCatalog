angular.module('onlineRegistry.services', [])
    .factory('baseServer', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new baseService($http, $location, onlineRegistryContext);
    }])
    .factory('importService', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new importService($http, $location, onlineRegistryContext);
    }])
    .factory('cardsService', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new cardsService($http, $location, onlineRegistryContext);
    }])
    .factory('shippingsService', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new shippingsService($http, $location, onlineRegistryContext);
    }])
    .factory('terbanksService', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new terbanksService($http, $location, onlineRegistryContext);
    }])
    .factory('usersService', ['$http', '$location', 'onlineRegistryContext', function ($http, $location, onlineRegistryContext) {
        return new usersService($http, $location, onlineRegistryContext);
    }])
    .factory('paginationService', function () {
        return new paginationService();
    })
    .factory('socket', function (socketFactory) {
        return socketFactory();
    });
