var fs = require('fs'),
    async = require('async'),
    config = require('config'),
    path = require('path'),
    _ = require('underscore'),
    util = require('util'),
    async = require('async'),
    validator = require('validator'),
    Event = require('../models/event'),
    User = require('../models/user'),
    EventSession = require('../models/eventSession'),
    EventParser = require('./eventParser').parser,
    EmailService = require('../services/emailService');

var findSpeakerByEmail = function(eventSessionViewModel, callback){
    User.findOne({email: eventSessionViewModel.speakerEmail}, callback);
}

exports.create = function(user, eventName, callback){
    if(validator.isNull(eventName)) return callback({message: "Job create failed: event name shouldn`t be empty"});
    var event = new Event({
        user: {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName
        },
        name: eventName
    });
    event.save(callback);
}

exports.update = function(user, eventId, eventName, callback){
    if(validator.isNull(eventName)) return callback({message: "Job update failed: event name shouldn`t be empty"});
    Event.findById({_id: eventId}, function(err, event){
        event.user = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName
        };

        event.name = eventName;
        event.save(callback);
    })
}

var getConfirmationUrl = function(eventSession, action){
    return util.format("http://%s/%s/%s",config.app.domain, action, eventSession.requestToken);
}

var sendEventSessionConfirmationEmail = function(eventSession, callback){
    //TODO: create accept, decline urls
    //and pass them in model
    Event.findById(eventSession.eventId, function(err, event){
        if(err) return callback({message: util.format('event with id: %s not found', eventSession.eventId)});
        EmailService.send(
            eventSession.speakerInfo.email,
            "Job Speaker Confirmation",
            "views/templates/emails/eventSessionConfirmation",
            {
                event: event,
                eventSession: eventSession,
                acceptUrl: getConfirmationUrl(eventSession, 'y'),
                declineUrl: getConfirmationUrl(eventSession, 'n')
            }, callback);
    })

}

exports.uploadFile = function (user, eventId, filePath, callback) {
    Event.findOne({_id: eventId}, function(err, event){
        if(err) return callback(err);
        if(!event.user.userId.equals(user._id)) return callback({message: "uploadFile: Can`t upload file, job not owned by current user"});
        var parser = new EventParser();
        parser.readFile(filePath, function(err, eventSessionViewModels){
            if(err) return callback(err);
            async.map(eventSessionViewModels, function(eventSessionViewModel, _callback){

                findSpeakerByEmail(eventSessionViewModel, function(err, speaker){
                    var eventSession = new EventSession({
                        eventId: event._id,
                        sessionInfo: {
                            name: eventSessionViewModel.eventName,
                            code: eventSessionViewModel.sessionId,
                            startDate: eventSessionViewModel.getStartDate(),
                            endDate: eventSessionViewModel.getEndDate(),
                            description: eventSessionViewModel.description
                        },
                        speakerInfo: {
                            firstName:eventSessionViewModel.speakerFirstName,
                            lastName:eventSessionViewModel.speakerLastName,
                            email: eventSessionViewModel.speakerEmail,
                            phone: eventSessionViewModel.speakerPhone
                        }
                    });
                    if(speaker){
                        eventSession.user = speaker._id;
                    }

                    eventSession.save(function(err, eventSession){
                        if(err) return _callback(err);
                        eventSession.generateRequestToken(function(err){
                            sendEventSessionConfirmationEmail(eventSession, function(err, message){
                                eventSession.setStatus(eventSessionStatusEnum.pending);
                            });
                            return _callback(err, eventSession);
                        });
                    });
                })
            }, function(err, eventSessions){
                if (err) return callback(err);

                // TODO: update stat also
                exports.updateSpeakersCount(event, function() {
                    callback(null, eventSessions);
                })
            })
        });
    })

}

exports.list = function(user, callback){
    if(!user) return callback({ message: "Can`t list events: user can`t be empty" });
    Event.find({'user.userId': user._id}, callback);
}

exports.getDetailsById = function(id, user, callback){
    if(!user) return callback({ message: "Can`t list events: user can`t be empty" });

    Event.findOne({ 'user.userId': user._id, _id: id }, function(err, event) {
        if (err) return callback(err);
        if (!event) return callback(null, null);

        EventSession.find({ eventId: event.id }, function(err, sessions) {
            if (err) return callback(err);

            event.sessions = sessions;
            callback(null, event);
        })
    });
}

exports.updateSpeakersCount = function(event, callback){
    EventSession.count({eventId: event._id}, function(err, speakersCount){
        if(err) return callback(err);
        event.speakersCount = speakersCount;
        event.save(callback);
    });
};