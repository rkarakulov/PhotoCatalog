require.config({
    baseUrl: "lib",
    paths: {
        'angular': 'angular/angular.min',
        'angularAMD': 'angularAMD/angularAMD.min',
        'ngload': 'angularAMD/ngload.min'
    },
    shim: {
        'angularAMD': ['angular'],
        'ngload': ['angularAMD']
    },    
    deps: ['app']
});