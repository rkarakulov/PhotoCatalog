var _ = require('underscore'),
    util = require('util'),
    moment = require('moment'),
    config = require('config'),
    validator = require('validator'),
    formidable = require('formidable'),
    EventService = require('../../services/eventService'),
    UserService = require('../../services/userService')

var translateSessionStatus = function (status) {
    switch(status) {
        case GLOBAL.eventSessionStatusEnum.pending:
            return 33;
        case GLOBAL.eventSessionStatusEnum.accepted:
            return 66;
        case GLOBAL.eventSessionStatusEnum.declined:
            return 100;
        case GLOBAL.eventSessionStatusEnum.complete:
            return 100;
        default:
            return 0;
    }
}

exports.events = function (req, res) {
    EventService.list(req.user, function(err, events){
        if (err) return res.send(500, err.message);

        res.render('organizer/events/index', {
            version: config.app.version,
            user: { },
            currentUser: req.user,
            events: events
        });
    });
}

exports.eventDetails = function(req, res) {
    EventService.getDetailsById(req.params.id, req.user, function(err, event) {
        if(err) return res.send(500, err.message);
        if(!event) return res.send(404, 'Event not found');

        // Format dates
        _.each(event.sessions, function(session) {
            if (session.sessionInfo.startDate) {
                session.sessionInfo.startDateFormatted = moment(session.sessionInfo.startDate).calendar();
            }

            session.completePercent = translateSessionStatus(session.status);
        });

        res.render('organizer/events/details', {
            version: config.app.version,
            user: { },
            currentUser: req.user,
            event: event,
            eventSessionStatuses: GLOBAL.eventSessionStatusEnum
        });
    });
}

exports.speakerDetails = function (req, res) {
    UserService.getById(req.params.id, function(err, user) {
        if(err) return res.send(500, err.message);
        res.redirect('/' + user.alias);
    });
}

exports.create = function(req, res){
    EventService.create(req.user, req.body.name, function(err, event){
        if(err) return res.send(500, err.message);
        res.send(200, event);
    });
}

exports.update = function(req, res){
    EventService.update(req.user, req.params.eventId, req.body.name, function(err, event){
        if(err) return res.send(500, err.message);
        res.send(200, event);
    });
}

exports.uploadFile = function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        EventService.uploadFile(req.user, fields.eventId, files.file.path, function(err, eventSessions){
            if(err) return res.send(500, {message: err.message});
            res.send(200, {ok: eventSessions.length > 0, eventSessionsCount: eventSessions.length});
        });
    });
}