var config = require('config'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    UserService = require('../../services/userService');

exports.init = function() {
  passport.use(new FacebookStrategy({
      clientID: config.app.social.facebook.appId,
      clientSecret: config.app.social.facebook.appSecret,
      callbackURL: config.app.social.facebook.callback
    },
    function(accessToken, refreshToken, profile, done) {
        UserService.getOrCreateUserByToken(accessToken, null, profile, function(err, user){
            done(err, user);
        });
    }
  ));
}