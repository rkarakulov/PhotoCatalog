var _ = require('underscore'),
    util = require('util'),
    config = require('config'),
    validator = require('validator'),
    EventSessionService = require('../services/eventSessionService');

exports.accept = function (req, res) {
    if (validator.isNull(req.params.token))
        return res.send(400, { message: 'Missing required token' });

    EventSessionService.handleToken(req.params.token, GLOBAL.eventSessionStatusEnum.accepted, req.user._id,
        function (err) {
            if (err) return res.send(err.statusCode || 500, err.message);
            res.redirect('/');
        }
    );
}

exports.confirmDecline = function (req, res) {
    if (validator.isNull(req.params.token))
        return res.send(400, { message: 'Missing required token' });

    res.redirect('/profile?decline=' + req.params.token);
}

exports.decline = function (req, res) {
    if (validator.isNull(req.params.token))
        return res.send(400, { message: 'Missing required token' });

    EventSessionService.handleToken(req.params.token, GLOBAL.eventSessionStatusEnum.declined, req.user._id,
        function (err) {
            if (err) return res.send(err.statusCode || 500, err.message);
            // Show confirmation
            res.send();
        }
    );
}