var SessionContentService = require('../services/sessionContentService'),
    formidable = require('formidable'),
    path = require('path'),
    config = require('config');

exports.list = function(req, res){
    SessionContentService.list(req.user, req.query.sessionId, function(err, sessionContents){
        if(err) return res.send(500, {message: err.message});
        res.send(200, sessionContents);
    })
}

exports.create = function(req, res){
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;

    form.parse(req, function(err, fields, files) {
        var path = SessionContentService.getUploadPath(req.user, fields.sessionId);
        SessionContentService.create(req.user, fields.sessionId, files, path, function(err, sessionContents){
            if(err) return res.send(500, {message: err.message});
            res.send(200, sessionContents);
        });
     });
}

exports.remove = function(req, res){
    SessionContentService.remove(req.user, req.params.id, function(err, isRemoved){
        res.send(200, {
            sessionContentId: req.params.id,
            isRemoved: isRemoved
        });
    })
}

exports.get = function(req, res){
    SessionContentService.getByIdBasedOnPrivacy(req.user, req.params.sessionContentId, function(err, sessionContent){
        if(err) return res.send(500, {message: err.message});
        if(!sessionContent) return res.send(404, {message: 'Session Content protected or not found.'});
        res.sendfile(sessionContent.filePath);
    })
}

exports.updateProtectStatus = function(req, res){
    SessionContentService.updateProtectStatus(req.user, req.params.sessionContentId, req.body.isProtected, function(err, sessionContent){
        if(err) return res.send(500, {message: err.message});
        res.send(200, sessionContent);
    });
}