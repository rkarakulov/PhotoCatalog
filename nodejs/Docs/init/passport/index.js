var passport = require('passport'),
    UserService = require('../../services/userService'),
    local = require('./passport-local').init,
    rememberMe = require('./passport-remember-me').init,
    facebook = require('./passport-facebook').init,
    twitter = require('./passport-twitter').init,
    linkedIn = require('./passport-linkedIn').init;

exports.init = function () {
    local();
    rememberMe();
    facebook();
    twitter();
    linkedIn();

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        UserService.getById(user._id, done);
    });
};