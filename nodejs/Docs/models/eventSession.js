var mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    crypto = require('crypto'),
    util = require('util');

var EventSessionSchema = new mongoose.Schema({
    eventId: {type: ObjectId, ref: 'event'},
    token: String,
    sessionInfo: {
        name: {type: String, required: true},
        code: {type: String, required: true},
        startDate: {type: Date, required: true},
        endDate: {type: Date, required: true},
        description: {type: String, required: true}
    },
    sessionId: ObjectId,
    speakerInfo: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true},
        phone: String
    },
    user: {
        userId: ObjectId,
        alias: String,
        firstName: String,
        lastName: String
    },
    requestToken: String,
    status: String // See GLOBAL.eventSessionStatusEnum
});

EventSessionSchema.methods.generateRequestToken = function(callback){
    var self = this;
    //TODO: check its unique
    crypto.randomBytes(2, function(err, buf) {
        if(err) return callback(err);
        self.requestToken = buf.toString('hex');
        self.save(callback);
    });
}

EventSessionSchema.methods.setStatus = function(status, callback){
    var self = this;
    self.status = status;
    self.save(callback);
}

EventSessionSchema.methods.speakerFullName = function(){
    return util.format('%s %s', this.speakerInfo.firstName, this.speakerInfo.lastName);
}

EventSessionSchema.pre('save', function(next){
    if(!this.token) this.token = crypto.randomBytes(32).toString('hex');
    next();
})

EventSessionSchema.post('save', function(next){
    // TODO: Temporaly disabled due to circular reference
    //EventService.updateStats(this.eventId, next);

//    mongoose.models.Event.findById(eventId, function(err, event){
//        mongoose.models.EventSession.count({eventId: this.eventId}, function(err, speakersCount){
//            if(err) return callback(err);
//            event.speakersCount = speakersCount;
//            event.save(callback);
//        });
//
//        //TODO: update status as average progress from eventSessions
//    });

});

EventSessionSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });
module.exports = mongoose.model('EventSession', EventSessionSchema, 'EventSession');