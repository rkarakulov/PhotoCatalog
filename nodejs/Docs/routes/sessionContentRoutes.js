var passport = require('passport'),
    config = require('config'),
    passreset = require('pass-reset'),
    authController = require('../controllers/authController'),
    resetPasswordController = require('../controllers/resetPasswordController'),
    profileController = require('../controllers/profileController'),
    sessionController = require('../controllers/sessionController'),
    templateController = require('../controllers/templateController'),

    sessionContentController = require('../controllers/sessionContentController'),
    UserService = require('../services/userService');

module.exports = function (app) {

    app.get('/api/session-content', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionContentController.list);

    app.post('/api/session-content', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionContentController.create);

    app.post('/api/session-content/:sessionContentId', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionContentController.updateProtectStatus);

    app.delete('/api/session-content/:id', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionContentController.remove);

    app.get('/session-content/:sessionContentId', sessionContentController.get);
}