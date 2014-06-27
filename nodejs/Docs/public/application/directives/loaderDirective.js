angular.module('loaderDirective', [])
    .directive('loader', function () {
        return {
            restrict: 'E',
            scope: {
                ngModel: "=",
                center: "&"
            },
            link: function (scope, element) {
                var loaderEl = $('<div>').addClass('loader-container').append($('<div>').addClass('pace-activity'));
                if (scope.center) loaderEl.addClass('center');
                element.replaceWith(loaderEl);
                scope.$watch(function () {
                    return scope.ngModel
                }, function (isLoading) {
                    if (isLoading)
                        loaderEl.show();
                    else
                        loaderEl.hide();
                })
            }
        }
    });
