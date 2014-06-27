var fs = require('fs'),
    async = require('async'),
    config = require('config'),
    path = require('path'),
    _ = require('underscore'),
    SessionContent = require('../models/sessionContent');

exports.list = function(user, sessionId, callback){
    if(!user) return callback({message: "Can`t list session content: user can`t be empty"});
    SessionContent.find({owner: user._id, session: sessionId}, callback);
}

var fileExtentionsValid = function(fileName){
    //TODO: check file extentions
    return true;
}

exports.create = function(user, sessionId, files, fileDirPath, callback){
    if(!user) return callback({message: "Can`t create session content: user can`t be empty"});
    if(_.filter(files, function(file){ return !fileExtentionsValid(file.name) }).length > 0)
        return callback({message: "Unsupported files can`t be uploaded."});

    var file = files.file;
    var fileBasePath = path.join(__dirname, "..", fileDirPath);
    fs.mkdirParent(fileBasePath, function(){
        var filePath = path.join(fileBasePath, file.name);

        var fileStream = fs.createReadStream(file.path);
        fileStream.pipe(fs.createWriteStream(filePath));
        fileStream.on('end',function(err) {
            if(err) return callback(err);

            var sessionContent = new SessionContent({
                owner: user._id,
                session: sessionId,
                fileName: file.name,
                filePath: filePath
            });

            sessionContent.save(function(err){
                callback(err, sessionContent);
            });
        });
    });
}

exports.getByIdBasedOnPrivacy = function(user, sessionContentId, callback){
    var protectCondition = { $or: [ {isProtected: false} ]};
    if(user) protectCondition.$or.push({isProtected: true, owner: user._id})

    SessionContent.findOne({
        $and:[
            { _id: sessionContentId},
            protectCondition
        ]
    }, callback);
}

exports.getUploadPath = function(user, sessionId){
    var uniqueId = sessionId;
    return path.join(config.app.sessionUploadPath, user._id.toHexString(), uniqueId);
}

exports.remove = function(user, sessionContentId, callback){
    if(!user) return callback({message: "Can`t remove session content: user can`t be empty"});
    SessionContent.findOne({owner: user._id, _id: sessionContentId}, function(err, sessionContent){
        if(err) return callback(err);

        if(fs.existsSync(sessionContent.filePath)) fs.unlinkSync(sessionContent.filePath);
        SessionContent.remove({owner: user._id, _id: sessionContentId}, function(err, count){
            callback(err, count > 0);
        });
    });
};

exports.updateProtectStatus = function(user, sessionContentId, isProtected, callback){
    if(!user) return callback({message: "Can`t change protect session content: user can`t be empty"});
    SessionContent.findOne({owner: user._id, _id: sessionContentId}, function(err, sessionContent){
        sessionContent.isProtected = !!isProtected;
        sessionContent.save(callback);
    });
}