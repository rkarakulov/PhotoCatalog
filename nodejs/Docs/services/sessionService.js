var _ = require('underscore'),
    async = require('async'),
    Session = require('../models/session'),
    SessionContent = require('../models/sessionContent');

exports.list = function(user, callback){
    if(!user) return callback({message: "Can`t list sessions: user can`t be empty"});
    Session.find({owner: user._id}, callback);
}

exports.create = function(user, entity, callback){
    if(!user || !entity) return callback({message: "Can`t create session: user and entity can`t be empty"});
    var session = new Session({
        owner: user._id,
        eventName: entity.eventName,
        sessionName: entity.sessionName,
        sessionDescription: entity.sessionDescription,
        handle: entity.handle,
        address: entity.address,
        startDate: entity.startDate,
        endDate: entity.endDate,
        isDeclined: entity.isDeclined || false
    });
    session.save(function(err, newSession){
        if(err) return callback(err);
        callback(null, newSession);
    });
}

exports.update = function(user, entityId, entity, callback){
    Session.findOne({_id: entityId}, function(err, session){
        if(err) return callback(err);
        if(!session.owner.equals(user._id)) return callback({message: "Cant update: session in not owned by user"});

        session.eventName = entity.eventName;
        session.sessionName = entity.sessionName;
        session.sessionDescription = entity.sessionDescription;
        session.handle = entity.handle;
        session.address = entity.address;
        session.startDate = entity.startDate;
        session.endDate = entity.endDate;

        session.save(function(err){
           callback(err, session);
        });
    });
}

exports.remove = function(user, entityId, callback){
    Session.remove({owner: user._id, _id: entityId}, function(err, count){
        callback(err, count > 0);
    });
}

exports.getUserPublicSessions = function(user, callback){
    Session.find({owner: user._id},null, {sort: {startDate: -1}},  function(err, sessions){
        if(err) return callback(err);
        var sessionIds = _.map(sessions, function(item){return item._id.toHexString()});
        SessionContent.find({owner: user._id , session: {$in: sessionIds}, isProtected: false}, function(err, sessionContents){
            if(err) return callback(err);
            var sessionViewModels = _.map(sessions, function(session){
                var contentItems = _.filter(sessionContents, function(content){
                    return session._id.equals(content.session)
                });
                return {session: session, sessionContents: contentItems};
            })
            callback(null, sessionViewModels);
        })
    });
}