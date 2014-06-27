var speakerStackApp = angular.module('speakerstack.profileController', []);
speakerStackApp.controller('profileController', ['$scope', '$http', '$modal', '$upload', 'config', 'profileService',
    function ($scope, $http, $modal, $upload, config, profileService) {

        $scope.isLoading = false;

        profileService.get(function (profile) {
            $scope.profile = profile;
        });

        $scope.openProfileEditor = function () {
            var modalInstance = $modal.open({
                backdrop: 'static',
                templateUrl: 'views/profile/profileEditorModal.html',
                controller: profileEditorModalController,
                resolve: {
                    profile: function () {
                        return $scope.profile;
                    }
                }
            });

            modalInstance.result.then(
                function (profile) {
                    $scope.profile = profile;
                    showSuccess('Profile successfully updated');
                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                }
            );
        };

        $scope.onProfileImageFileSelect = function ($files) {
            if (!$files) return;

            var file = $files[0];
            if (!isImageFileValid(file, config.profileImage))
                return;

            $scope.isLoading = true;
            $scope.upload = profileService.updateImage(file, function (data) {
                $scope.isLoading = false;
                $scope.profile.profileImageUrl = data.profileImageUrl;
                showSuccess('Profile image successfully changed');
            });
        };

        $scope.onProfileBackgroundImageFileSelect = function ($files) {
            if (!$files) return;

            var file = $files[0];
            if (!isImageFileValid(file, config.profileBackgroungImage))
                return;

            $scope.isLoading = true;
            $scope.upload = profileService.updateBackground(file, function (data) {
                $scope.isLoading = false;
                $scope.profile.backgroundImageUrl = data.backgroundImageUrl;
                showSuccess('Background image successfully changed');
            });
        };

        $scope.getProfileInfo = function (name) {
            if (!$scope.profile) return;

            var item = _.find($scope.profile.info, function (item) {
                return item.type == name
            });
            return item ? item.value : null;
        };

        function isImageFileValid(file, specificLimits) {
            var fileType = file.name.toLowerCase().split('.', 2)[1];
            if (specificLimits.allowedFileTypes.indexOf(fileType) == -1) {
                showError('Image can\'t be uploaded. Only following file types allowed: '
                    + specificLimits.allowedFileTypes.join(', '));
                return false;
            }

            var fileSize = file.size;
            if (fileSize > specificLimits.maxFileSizeInBytes) {
                showError('Selected file too large. Please select another one.');
                return false;
            }

            return true;
        }

        function showError(message) {
            Messenger().post({
                message: message,
                type: 'error',
                showCloseButton: true
            });
        }

        function showSuccess(message) {
            Messenger().post({
                message: message,
                showCloseButton: true
            });
        }
    }
]);

var profileEditorModalController = function ($scope, $modalInstance, $q, $location, $anchorScroll, config, profileService, profile) {
    $scope.errorMessage = null;
    $scope.profileImageConfig = config.profileImage;
    $scope.profile = angular.copy(profile);

    // Converst info array to object
    $scope.profile.infoObject = {};
    angular.forEach(profile.info, function (item, key) {
        $scope.profile.infoObject[item.type] = item.value;
    });

    $scope.update = function () {
        $scope.errorMessage = null;
        var profile = angular.copy($scope.profile);

        profile.info = [];
        angular.forEach($scope.profile.infoObject, function (value, key) {
            profile.info.push({ type: key, value: value });
        });

        // No need to store this object
        delete profile.infoObject;

        profileService.update(
            profile,
            $scope.image,
            function (profile) {
                // Return profile to view
                $modalInstance.close(profile);
            }, function (error) {
                $scope.errorMessage = error.errors
                    ? error.errors.join('<br/>') : (error.message ? error.message : error);
                // Scroll to error
                $location.hash('modal-header');
                $anchorScroll();
                $location.hash('');
            }
        );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
