var passport = require('passport'),
    config = require('config'),
    authController = require('../../controllers/organizer/authController'),
    UserService = require('../../services/userService');

module.exports = function (app) {
    app.get('/showorg/login', authController.login);
    app.post('/showorg/login', authController.authenticate);
    app.get('/showorg/logout', authController.logout);
    app.post('/showorg/auth/email', authController.createUser);
}