var speakerStackApp = angular.module('speakerstack.sessionContentController', []);
speakerStackApp.controller('sessionContentController', ['$scope', '$http', '$modal', 'sessionContentService', function ($scope, $http, $modal, sessionContentService) {
    $scope.init = function (session) {
        $scope.session = session;
    }

    $scope.list = function () {
        $scope.isLoading = true;
        sessionContentService.list($scope.session, function (sessionContents) {
            $scope.sessionContents = sessionContents;
            $scope.isLoading = false;
        });
    }

    $scope.remove = function (sessionContent) {
        sessionContent.isRemoving = true;
        sessionContentService.remove(sessionContent, function (response) {
            sessionContent.isRemoving = false;
            if (response.isRemoved) {
                var index = $scope.sessionContents.indexOf(sessionContent);
                if (index >= 0) $scope.sessionContents.splice(index, 1);
            }
        });
    }

    $scope.create = function () {
        var modalInstance = $modal.open({
            backdrop: 'static',
            templateUrl: 'views/profile/sessionContentUploadModal.html',
            controller: 'sessionContentUploadModalController',
            resolve: {
                session: function () {
                    return $scope.session;
                }
            }
        });

        modalInstance.result.then(
            function () {
                $scope.list();
            }, function () {
            }
        );
    }

    $scope.toggleProtectStatus = function (sessionContent) {
        sessionContent.isProtected = !sessionContent.isProtected;
        sessionContentService.updateProtectStatus(sessionContent, function (sessionContent) {
        });
    }

    $scope.getContentUrl = function (sessionContent) {
        return '/session-content/' + sessionContent._id;
    }

    $scope.getProtectedClass = function (sessionContent) {
        return sessionContent.isProtected ? "fa-lock" : "fa-unlock";
    }

    $scope.list();
}]);


speakerStackApp.controller('sessionContentUploadModalController', ['$scope', '$modalInstance', '$fileUploader', 'sessionContentService', 'session',
    function ($scope, $modalInstance, $fileUploader, sessionContentService, session) {
        $scope.session = session;

        $scope.uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,                          // to automatically update the html. Default: $rootScope
            url: '/api/session-content',
            formData: [
                { sessionId: $scope.session._id }
            ],
            filters: [
                function (item) {
                    var allowed = /(pdf|doc|xls|docx|xlsx|.ppt|.pptx|png|jpeg|jpg|gif|mp3|mp4|mpeg|presentation|m4a)$/.test(item.type);
                    if (!$scope.showNotAllowedError) $scope.showNotAllowedError = !allowed;
                    return allowed;
                }
            ]
        });

        $scope.uploader.bind('completeall', function () {
            $scope.uploader.isUploading = true;
            setTimeout($modalInstance.close, 1000);
        })

        $scope.hasProgressClass = function (file) {
            return file.progress ? "has-progress" : "";
        }

        $scope.queueNotEmpty = function () {
            return $scope.uploader.queue.length > 0;
        }

        $scope.uploadAll = function () {
            $scope.uploader.uploadAll();
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };
    }]);
