var mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    path = require('path');

var SessionContentSchema = new mongoose.Schema({
    owner: {type: ObjectId, require: true},
    session: ObjectId,
    fileName: {type: String, require: true},
    filePath: {type: String, require: true},
    isProtected: {type:Boolean, default: false}
});

SessionContentSchema.methods.getUrl = function(){
    return path.join('/session-content/', this._id.toHexString());
}

SessionContentSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });
module.exports = mongoose.model('SessionContentSchema', SessionContentSchema, 'SessionContentSchema');