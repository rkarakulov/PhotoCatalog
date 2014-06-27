var SessionService = require('../services/sessionService');

exports.list = function(req, res){
    SessionService.list(req.user, function(err, sessions){
        if(err) return res.send(500, {message: err.message});
        res.send(200, sessions);
    });
}

exports.create = function(req, res){
    SessionService.create(req.user,req.body, function(err, session){
        if(err) return res.send(500, {message: err.message});
        res.send(200, session);
    });
}

exports.update = function(req, res){
    SessionService.update(req.user, req.params.id, req.body, function(err, session){
        if(err) return res.send(500, {message: err.message});
        res.send(200, session);
    });
}

exports.remove = function(req, res){
    SessionService.remove(req.user, req.params.id, function(err, isRemoved){
        if(err) return res.send(500, {message: err.message});
        res.send(200, {
            sessionId: req.body.sessionId,
            isRemoved: isRemoved
        });
    });
}