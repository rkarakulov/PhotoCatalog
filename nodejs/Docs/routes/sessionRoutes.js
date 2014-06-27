var sessionController = require('../controllers/sessionController'),
    UserService = require('../services/userService');

module.exports = function (app) {

    app.get('/api/session', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionController.list);

    app.post('/api/session', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionController.create);

    app.post('/api/session/:id', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionController.update);

    app.delete('/api/session/:id', UserService.ajaxAuthorizedOnly(), UserService.ajaxSpeakerOnly,
        UserService.ajaxCompleteStatusOnly, sessionController.remove);

}