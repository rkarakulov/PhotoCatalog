var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    UserService = require('../../services/userService');

exports.init = function() {
  passport.use(new LocalStrategy({
          usernameField: 'login',
          passwordField: 'password'
      },
      function(login, password, done) {
          UserService.validateUser(login, password, function(err, user, info){
              done(err, user, info);
          });
      }
    ));
};