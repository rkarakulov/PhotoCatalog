var profileController = require('../controllers/profileController'),
    UserService = require('../services/userService');

module.exports = function (app) {

    app.get('/profile', UserService.authorizedOnly(), UserService.speakerOnly, UserService.completeStatusOnly,
        profileController.privateProfile);

    app.get('/api/user/current', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.get);
    app.post('/api/user/current', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.update);
    app.get('/api/user/current/image', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.profileImage);
    app.post('/api/user/current/image', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.updateProfileImage);
    app.get('/api/user/current/background', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.backgroundImage);
    app.post('/api/user/current/background', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.updateBackgroundImage);

    app.post('/api/user/send-message', UserService.ajaxAuthorizedOnly(), UserService.ajaxCompleteStatusOnly,
        profileController.sendMessage);
}