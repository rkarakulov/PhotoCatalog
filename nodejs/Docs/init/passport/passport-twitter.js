var config = require('config'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    UserService = require('../../services/userService');

exports.init = function() {
    passport.use(new TwitterStrategy({
            consumerKey: config.app.social.twitter.appId,
            consumerSecret: config.app.social.twitter.appSecret,
            callbackURL: config.app.social.twitter.callback
        },
        function(token, tokenSecret, profile, done) {
            UserService.getOrCreateUserByToken(token, tokenSecret, profile, done);
        }
    ));
}