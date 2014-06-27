var eventController = require('../../controllers/organizer/eventController'),
    UserService = require('../../services/userService');

module.exports = function (app) {

    app.get('/showorg', UserService.authorizedOnly('/showorg/login'), UserService.showOrganizerOnly,
        eventController.events);

    app.get('/showorg/:id', UserService.authorizedOnly('/showorg/login'), UserService.showOrganizerOnly,
        eventController.eventDetails);

    app.get('/showorg/speaker/:id', UserService.authorizedOnly('/showorg/login'), UserService.showOrganizerOnly,
        eventController.speakerDetails);

    app.post('/api/events', UserService.ajaxAuthorizedOnly('/showorg/login'), UserService.ajaxShowOrganizerOnly, eventController.create);

    app.post('/api/events/:eventId', UserService.ajaxAuthorizedOnly('/showorg/login'), UserService.ajaxShowOrganizerOnly,
        eventController.update);

    app.post('/api/events/:eventId/upload', UserService.ajaxAuthorizedOnly('/showorg/login'), UserService.ajaxShowOrganizerOnly,
        eventController.uploadFile);

}