var speakerStackApp = angular.module('speakerstack.sessionController', []);
speakerStackApp.controller('sessionController', ['$scope', '$http', '$modal', 'sessionService', function ($scope, $http, $modal, sessionService) {
    $scope.currentDate = new Date();

    $scope.list = function () {
        $scope.isLoading = true;
        sessionService.list(function (sessions) {
            $scope.sessions = sessions;
            $scope.reorderSessions();
            $scope.isLoading = false;
        });
    }

    $scope.showModal = function (session) {
        if (!session.startDate) session.startDate = new Date();

        var modalInstance = $modal.open({
            backdrop: 'static',
            templateUrl: 'views/profile/sessionEditorModal.html',
            controller: 'sessionEditorModalController',
            resolve: {
                session: function () {
                    return session;
                }
            }
        });

        modalInstance.result.then(
            function (session) {
                sessionService.createOrUpdate(session, function (updatedSession, isNew) {
                    var currentSession = _.filter($scope.sessions, function (item) {
                        return item._id == session._id
                    })[0];
                    var index = $scope.sessions.indexOf(currentSession);
                    if (index >= 0) $scope.sessions.splice(currentSession, 1);
                    $scope.sessions.push(updatedSession);
                    $scope.reorderSessions();
                });
            }, function () {
            }
        );
    }

    $scope.add = function () {
        $scope.showModal({});
    }

    $scope.update = function (session) {
        $scope.showModal(session);
    }

    $scope.remove = function (session) {
        session.isUpdating = true;
        sessionService.remove(session, function (response) {
            session.isUpdating = false;
            var index = $scope.sessions.indexOf(session);
            if (index >= 0) $scope.sessions.splice(index, 1);
            $scope.reorderSessions();
        })
    }

    $scope.reorderSessions = function () {
        $scope.sessions = _.sortBy($scope.sessions, function (item) {
            return -1 * new Date(item.startDate).getTime();
        })
    }

    $scope.getDate = function (session) {
        var date = session ? session.startDate : new Date();
        return moment(date).calendar();
    }

    $scope.getTime = function (session) {
        var date = session ? session.startDate : new Date();
        return moment(date).format('hh:mm');
    }

    $scope.getMeridian = function (session) {
        var date = session ? session.startDate : new Date();
        return moment(date).format('A');
    }

    $scope.list();
}]);


speakerStackApp.controller('sessionEditorModalController', ['$scope', '$modalInstance', 'sessionService', 'session',
    function ($scope, $modalInstance, sessionService, session) {
        $scope.session = angular.copy(session);

        $scope.update = function () {
            $modalInstance.close($scope.session);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);
