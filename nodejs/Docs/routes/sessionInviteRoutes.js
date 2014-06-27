var sessionInviteController = require('../controllers/sessionInviteController'),
    UserService = require('../services/userService');

module.exports = function (app) {
    app.get('/y/:token', UserService.authorizedOnly(), UserService.speakerOnly, UserService.completeStatusOnly,
        sessionInviteController.accept);
    app.get('/n/:token', UserService.authorizedOnly(), UserService.speakerOnly, UserService.completeStatusOnly,
        sessionInviteController.confirmDecline);

    app.post('/api/session-content/decline/:token', UserService.authorizedOnly(), UserService.speakerOnly,
        UserService.completeStatusOnly, sessionInviteController.decline);
}