var fs = require('fs'),
    async = require('async'),
    config = require('config'),
    path = require('path'),
    _ = require('underscore'),
    Event = require('../models/event'),
    EventSession = require('../models/eventSession'),
    SessionService = require('../services/sessionService'),
    UserService = require('../services/userService');

exports.getPendingInviteByToken = function (token, callback) {
    EventSession.findOne({ token: token, status: GLOBAL.eventSessionStatusEnum.pending }, callback);
};

exports.updateStats = function (event, callback) {
    EventSession.count({ eventId: event._id,  }, function (err, speakersCount) {
        if (err) return callback(err);
        //TODO: update status as average progress from eventSessions
        //event.completePercent = 'TODO'
        event.save(callback);
    });
};

exports.handleToken = function (token, status, userId, callback) {
    // Check token
    exports.getPendingInviteByToken(token, function (err, eventSession) {
        if (err) return callback(err);
        if (!eventSession) return callback({ statusCode: 400, message: 'Token not found' });

        Event.findById(eventSession.eventId, function (err, event) {
            if (err) return callback(err);
            if (!event) return callback({ statusCode: 500, message: 'Token related event not exists!' });

            // Create session for speaker
            var session = {
                eventName: event.name,
                sessionName: eventSession.sessionInfo.name,
                sessionDescription: eventSession.sessionInfo.description,
                //handle: entity.handle,
                //address: entity.address,
                startDate: eventSession.sessionInfo.startDate,
                endDate: eventSession.sessionInfo.endDate,
                isDeclined: status == GLOBAL.eventSessionStatusEnum.declined
            };

            SessionService.create({ _id: userId }, session, function (err, session) {
                if (err) return callback(err);

                UserService.getById(userId, function (err, user) {
                    if (err) return callback(err);

                    // Update session status
                    eventSession.user = {
                        userId: userId,
                        alias: user.alias,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                    eventSession.status = status;
                    eventSession.save(function (err) {
                        if (err) return callback(err);

                        exports.updateStats(event);

                        callback(null);
                    });
                });
            });
        });
    });
}