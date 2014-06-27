var mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    moment = require('moment');

var SessionSchema = new mongoose.Schema({
    owner: {type: ObjectId, required: true},
    eventName: {type: String, default: ""},
    sessionName: {type: String, required: true},
    sessionDescription: {type: String, required: true},
    handle: String,
    address: String,
    startDate: {type: Date, required: true},
    endDate: Date,
    isDeclined: Boolean
});

SessionSchema.methods.getDate = function(){
    return moment(this.startDate).format("MM/D/YYYY h:mm A");
}

SessionSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });
module.exports = mongoose.model('Session', SessionSchema, 'Session');