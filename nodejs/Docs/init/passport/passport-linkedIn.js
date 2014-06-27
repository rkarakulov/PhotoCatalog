var config = require('config'),
    passport = require('passport'),
    LinkedInStrategy = require('passport-linkedIn').Strategy,
    UserService = require('../../services/userService');

exports.init = function() {
  passport.use(new LinkedInStrategy({
      consumerKey: config.app.social.linkedIn.appId,
      consumerSecret: config.app.social.linkedIn.appSecret,
      callbackURL: config.app.social.linkedIn.callback
    },
    function(token, tokenSecret, profile, done) {
        UserService.getOrCreateUserByToken(token, tokenSecret, profile, done);
    }
  ));
}