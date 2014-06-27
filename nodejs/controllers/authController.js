var UserService = require('../services/userService');

exports.login = function (request, response, next) {
    UserService.authenticate(request, response, next)
}

exports.logout = function (request, response, next) {
    UserService.logout(request, response, next);
}