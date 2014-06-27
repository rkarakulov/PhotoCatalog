var mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var EventSchema = new mongoose.Schema({
    user: {
        userId: {type: ObjectId, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
    },
    name: {type: String, required: true},
    description: {type: String},
    speakersCount: {type: Number},
    completePercent: {type: Number}
});

EventSchema.methods.haveSpeakers = function(){
    return this.speakersCount > 0;
}

EventSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });
module.exports = mongoose.model('Event', EventSchema, 'Event');