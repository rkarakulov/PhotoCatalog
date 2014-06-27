var fs = require('fs'),
    util = require('util'),
    _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    config = require('../config/default.js'),
    passport    = require('passport'),
    User = require('../models/user');


var getLoginUrl = function (req, defaultRoute) {
    defaultRoute = defaultRoute || '/login';
    return defaultRoute + '?redirectUrl=' + req.url;
}

exports.validateUser = function (login, password, callback) {
    User.findOne({ "login": login }, function (err, user) {
        /*user.setPassword(password, function () {
            user.save(function (err) {

            });
        });*/

        ''

        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false, { message: 'Неверный логин.' });
        }
        user.checkPassword(password, function (passwordValid) {
            if (passwordValid)
                return callback(null, user);
            else
                return callback(null, false, { message: 'Неверный пароль.' });
        });
    });
};

exports.ajaxInRoleOnly = function(roles, defaultRoute){
    return function (req, res, next) {
        if (_.contains(roles, req.user.role))
            return next();

        res.status(404).send({
            status: 404,
            error: "У Вас не хватает прав для просмотра данной страницы",
            redirectUrl: defaultRoute || '/login'
        });
    };
}

exports.ajaxAuthorizedOnly = function(defaultRoute){
    return function (req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.clearCookie('userRole');
        res.status(403).send({
            status: 403,
            error: '',
            redirectUrl: defaultRoute || '/login'
        });
    };
}

var logIn = function (req, res, user, next) {
    req.logIn(user, function (err) {
        if (err)
            return next(err);

        //return res.redirect(req.session.redirectUrl
        //    ? req.session.redirectUrl : '/');

        res.cookie('userRole', user.role);
        return res.send({
            success: 'Успешный вход в систему',
            currentUser: user
        });

    });
}

exports.getById = function (id, callback) {
    User.findById(id, callback);
}

exports.logout = function(request, response, next){
    response.clearCookie('token');
    response.clearCookie('userRole');
    request.logout();
    response.send({
        success: 'Выход произведен успешно'
    });
};

exports.authenticate = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user)
            //return res.status(403).send({
            return res.send({
                status: 403,
                error: info.message,
                currentUser: { login: req.body.login }
            });

        if (req.body.rememberMe) {
            user.generateAutoLoginToken(function (err, user) {
                if (err) return next(err);
                res.cookie(config.app.rememberPassword.cookieName, user.autoLoginHash, {
                    path: '/',
                    httpOnly: true,
                    maxAge: config.app.rememberPassword.maxAgeInMilliseconds
                });
                logIn(req, res, user, next);
            });
        } else {
            logIn(req, res, user, next);
        }
    })(req, res, next);
}