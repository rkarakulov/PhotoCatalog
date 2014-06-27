var _ = require('underscore'),
    config = require('config'),
    async = require('async'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    timestamps = require('mongoose-times'),
    validator = require('validator');

var TokenSchema = new mongoose.Schema({
    provider: String,
    socialId: String,
    accessToken: String,
    tokenSecret: String
});

var ProfileInfoSchema = new mongoose.Schema({
    type: String,
    value: String
});

var UserSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    isAdmin: Boolean,
    password: String,
    salt: String,
    tokens: [TokenSchema],
    profileImageUrl: String,
    backgroundImageUrl: String,
    info: [ProfileInfoSchema],
    bio: String,
    alias: String,
    created_at: Date,
    updated_at: Date,
    autoLoginHash: String,
    role: String
});

UserSchema.plugin(timestamps, { created: "createdAt", lastUpdated: "updatedAt" });

UserSchema.pre('save', function (next) {
    var self = this;

    if (self.role == roleEnum.speaker && (!self.alias || self.alias.length == 0)) {
        // Generate alias
        generateAlias(self, function (alias) {
            self.alias = alias;
            next();
        });
    } else {
        next();
    }
})

UserSchema.statics.validateAlias = function (alias, userId, callback) {
    var normalizedAlias = (alias || '').trim();

    // Check used words
    var deniedAliasesRegex = new RegExp('^(' + config.app.deniedAliases.join('|') + ')$', 'i');
    if (deniedAliasesRegex.test(normalizedAlias))
        return callback(null, false);

    var query = { alias: { $regex: new RegExp('^' + normalizedAlias + '$', 'i') } };
    if (userId) query._id = {$ne: userId};

    mongoose.models['User'].count(query, function (err, count) {
        if (err) return callback(err);
        callback(null, count == 0);
    });
}

var generateAlias = function (entity, callback) {
    var uniqueNumber = '';
    var defaultAlias = (entity.firstName + entity.lastName).replace(/[^A-Za-z0-9\.\-_]/g, '');
    if (defaultAlias.length == 0)
        defaultAlias = entity._id.toString();

    async.forever(
        function (next) {
            var alias = defaultAlias + uniqueNumber.toString();

            UserSchema.statics.validateAlias(alias, entity._id, function (err, isValid) {
                if (isValid) return next(alias);
                uniqueNumber = parseInt(uniqueNumber || '0') + 1;
                next();
            });

        },
        function (alias) {
            callback(alias);
        }
    );
};

UserSchema.methods.isInRole = function(roleName){
    return this.role == roleName;
}

UserSchema.methods.isComplete = function () {
    var isComplete = validator.isEmail(this.email)
        && !validator.isNull(this.firstName)
        && !validator.isNull(this.lastName)
        && !validator.isNull(this.getInfo(infoTypeEnum.postalCode));

    return this.isInRole(roleEnum.organizer) || isComplete;
}

UserSchema.methods.isShowOrganizer = function () {
    return this.role == roleEnum.organizer;
}

UserSchema.methods.updateInfo = function (infoCollection, callback) {
    if (!infoCollection) return callback();

    var self = this;
    _.each(infoCollection, function (info, index) {
        var infoItem = _.filter(self.info, function (item) {
            return item.type == info.type;
        })[0];

        if (infoItem)
            infoItem.value = info.value;
        else
            self.info.push({type: info.type, value: info.value});
    });

    callback();
}

UserSchema.getAccessToken = function (provider) {
    var token = _.filter(this.tokens, function (item) {
        return item.provider == provider
    })[0];

    return token ? token.accessToken : null;
}

UserSchema.methods.getInfo = function (infoType) {
    var self = this;
    var item = _.filter(self.info, function (item) {
        return item.type == infoType
    })[0];

    return item ? item.value : null;
}

UserSchema.methods.getInfoTypes = function(){
    var self = this;
    var types = _.chain(self.info).filter(function(item){return item.value && item.type != 'title'}).map(function(item){return item.type}).value();
    return types;
}

UserSchema.methods.hasInfo = function(infoType){
    var self = this;
    var item = _.filter(self.info, function(item){return item.type == infoType})[0];
    return item && item.value;
}

UserSchema.methods.setPassword = function (password, callback) {
    var self = this;
    self.salt = crypto.randomBytes(128).toString('base64');
    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        self.password = derivedKey;
        callback();
    });
}

UserSchema.methods.checkPassword = function (password, callback) {
    var self = this;
    if(!self.salt) return callback(false);

    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        callback(self.password == derivedKey);
    });
}

UserSchema.methods.generateAutoLoginToken = function(callback){
    this.autoLoginHash = crypto.randomBytes(32).toString('hex');
    this.save(function(err){
        // No need to wait success, since this operation is not critical
    });

    callback(null, this)
}

UserSchema.methods.clearAutoLoginToken = function(callback){
    delete this.autoLoginHash;
    this.save(function(err){
        // No need to wait success, since this operation is not critical
    });

    callback(null, this)
}

UserSchema.methods.toJson = function () {
    var obj = this.toObject()
    delete obj.password;
    delete obj.salt;
    delete obj.tokens;

    return obj
}

module.exports = mongoose.model('User', UserSchema, 'User');