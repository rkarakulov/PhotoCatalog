var config = require('config'),
    passreset = require('pass-reset');

exports.get = function (req, res) {
    // Render page with password here
    res.render('password/reset', { token: req.params.token });
}

exports.requestToken = passreset.requestResetToken({
    loginParam: 'email',
    callbackURL: config.app.forgotPassword.callbackUrl
})

exports.reset = passreset.resetPassword({
    tokenParam: 'token',
    passwordParam: 'password',
    confirmParam: 'confirm'
});
