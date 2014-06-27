var speakerStackApp = angular.module('speakerstack.config', []);
speakerStackApp.constant('config', {
    profileImage: {
        allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
        maxFileSizeInBytes: 1819200
    },
    profileBackgroungImage: {
        allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
        maxFileSizeInBytes: 1819200
    }
});