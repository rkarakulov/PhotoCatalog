var _ = require('underscore'),
    config = require('config'),
    passport = require('passport'),
    validator = require('validator'),
    UserService = require('../../services/userService');

exports.login = function(req, res) {
    if(req.query.redirectUrl)
        req.session.redirectUrl = req.query.redirectUrl;

    res.render('organizer/auth/index', {
        regUser: null,
        loginUser: null,
        version: config.app.version
    });
}

exports.logout = function(req, res) {
    res.clearCookie('token');
    req.logout();
    res.redirect('/showorg');
}

exports.authenticate = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user)
            return res.render(
                'organizer/auth/index',
                {
                    loginUser: { email: req.body.email },
                    message: info.message
                }
            );

        if (req.body.rememberMe) {
            user.generateAutoLoginToken(function(err, user){
                if (err) return next(err);

                res.cookie(config.app.rememberPassword.cookieName, user.autoLoginHash, {
                    path: '/showorg',
                    httpOnly: true,
                    maxAge: config.app.rememberPassword.maxAgeInMilliseconds
                });
                loginCore(req, res, user, next);
            })
        } else {
            loginCore(req, res, user, next);
        }
    })(req, res, next);
}


var loginCore = function(req, res, user, next) {
    req.logIn(user, function(err) {
        if (err) return next(err);
        return res.redirect('/showorg');
    });
}

exports.createUser = function(req, res){
    if(!validator.isEmail(req.body.email)
        || validator.isNull(req.body.firstName)
        || validator.isNull(req.body.lastName)
        || validator.isNull(req.body.company)
        || validator.isNull(req.body.password)
        || !validator.isLength(req.body.password, 6))
        return res.redirect('/showorg/login');

    UserService.createByEmail({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        password: req.body.password,
        role: roleEnum.organizer
    }, function(err, user){
        var message = err ? err.message : null;
        if(err && err.message)
            return res.render('organizer/auth/index', {regUser: user, message: message});

        req.login(user, function(){
            res.redirect(user.isComplete()? '/showorg':  '/showorg/login');
        });
    });
}
