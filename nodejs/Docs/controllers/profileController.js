var _ = require('underscore'),
    util = require('util'),
    config = require('config'),
    validator = require('validator'),
    formidable = require('formidable'),
    UserService = require('../services/userService'),
    SessionService = require('../services/sessionService'),
    EmailService = require('../services/emailService');

exports.index = function (req, res) {
    res.redirect('/profile');
}

exports.privateProfile = function (req, res) {
    res.sendfile('public/views/profile/index.html');
}

exports.publicProfile = function (req, res) {
    var alias = req.params.userAlias;
    UserService.getByAlias(alias, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) return res.send(500, {message: util.format("User with alias: %s not found", alias)});

        SessionService.getUserPublicSessions(user, function (err, sessions) {
            var sessionContents = _.chain(sessions).map(function(session){return session.sessionContents}).flatten().value();
            res.render('profile/public', {
                user: user,
                sessions: sessions,
                sessionContents: sessionContents,
                currentUser: req.user,
                url: req.url
            });
        });
    })
}

exports.get = function (req, res) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return res.send(500, { message: err.message });
        res.send(user.toJson());
    });
}

exports.update = function (req, res) {
    form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        UserService.updateProfile(req.user, fields, files, function (err, user, validation) {
            if (err) return res.send(500, { message: err.message });
            if (validation) return res.send(400, { message: 'Validation error', errors: validation });

            res.send(user.toJson());
        });
    });
}

exports.sendMessage = function (req, res) {
    UserService.sendMessage(req.user, req.body.userId, req.body.message, function (err) {
        if (err) return res.send(500, { message: err.message });
        res.send();
    })
}

exports.profileImage = function (req, res) {
    // No need to check user existence since user already authenticated
    UserService.getProfilePicturePathByUser(req.user, config.app.profileImages.path, function (err, path) {
        if (err) return res.send(500, { message: err.message });
        if (!path) return res.send(404, { message: 'File not found' });

        res.sendfile(path);
    });
}

exports.backgroundImage = function (req, res) {
    // No need to check user existence since user already authenticated
    UserService.getProfilePicturePathByUser(req.user, config.app.profileBackgroundImages.path,
        function (err, path) {
            if (err) return res.send(500, { message: err.message });
            if (!path) return res.send(404, { message: 'File not found' });

            res.sendfile(path);
        }
    );
}

exports.updateProfileImage = function (req, res) {
    form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (!files || !files.file) {
            res.send(400, { message: 'Missing required image file' });
            return;
        }

        UserService.updateProfileImage(req.user, files.file, function (err, url) {
            if (err) return res.send(500, { message: err.message });
            res.send({
                profileImageUrl: url
            });
        });
    });
}

exports.updateBackgroundImage = function (req, res) {
    form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (!files || !files.file) {
            res.send(400, { message: 'Missing required image file' });
            return;
        }

        UserService.updateBackgroundImage(req.user, files.file, function (err, url) {
            if (err) return res.send(500, { message: err.message });
            res.send({
                backgroundImageUrl: url
            });
        });
    });
}