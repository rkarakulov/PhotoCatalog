var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    isAdmin: Boolean,
    password: String,
    login: String,
    autoLoginHash: String,
    role: String,
    phone: String,
    verifyCode: String,
    salt: String
});

UserSchema.methods.isInRole = function(roleName){
    return this.role == roleName;
}

UserSchema.methods.setPassword = function (password, callback) {
    var self = this;
    self.salt = crypto.randomBytes(128).toString('base64');
    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        self.password = derivedKey;
        callback();
    });
}

UserSchema.methods.checkPassword= function (password, callback) {
     var self = this;
     callback(self.password == password);

/*    var self = this;
    crypto.pbkdf2(password, self.salt, 10000, 512, function (err, derivedKey) {
        callback(self.password == derivedKey);
    });*/
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

module.exports = mongoose.model('User', UserSchema, 'User');