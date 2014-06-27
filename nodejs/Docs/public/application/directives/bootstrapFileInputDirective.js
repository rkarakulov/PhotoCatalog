angular.module('bootstrapFileInputDirective', [])
    .directive('bootstrapFileInput', function () {
        return{
            scope: false,
            link: function (scope, element) {
                element.bootstrapFileInput();
            }
        }
    });