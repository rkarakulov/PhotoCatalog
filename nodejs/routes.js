var cardsController = require('./controllers/cardsController'),
    shippingsController = require('./controllers/shippingsController'),
    terbanksController = require('./controllers/terbanksController'),
    usersController = require('./controllers/usersController'),
    importController = require('./controllers/importController'),
    authController = require('./controllers/authController');
var passport    = require('passport');
var UserService = require('./services/userService');

var ApiPathPrefix = '/api';

module.exports.init = function (app, socket) {
    app.get(ApiPathPrefix + '/cards/search',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin', 'search']),
        cardsController.search);

    app.get(ApiPathPrefix + '/cards/report',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin', 'report']),
        cardsController.report);

    app.get(ApiPathPrefix + '/cards/printStatuses',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin', 'report']),
        cardsController.printStatuses);

    app.get(ApiPathPrefix + '/cards/searchClient',
        cardsController.searchClient);

    app.get(ApiPathPrefix + '/cards/captcha.png',
        cardsController.captcha);

    app.get(ApiPathPrefix + '/shippings',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin']),
        shippingsController.list);

    app.get(ApiPathPrefix + '/terbanks',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin']),
        terbanksController.list);

    app.get(ApiPathPrefix + '/users',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin']),
        usersController.list);

    app.get(ApiPathPrefix + '/import',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin']),
        importController.list);

    app.get(ApiPathPrefix + '/import/getLastImport',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin', 'report', 'search']),
        importController.getLastImport);

    app.post(ApiPathPrefix + '/import/upload',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin']),
        importController.upload);

    app.post(ApiPathPrefix + '/import/import',
        UserService.ajaxAuthorizedOnly(),
        UserService.ajaxInRoleOnly(['superAdmin', 'admin']),
        function(req, res){
            socket.emit('test', {
                extractedRowsCount: -1
            });

            importController.import(req, res, socket);
        });

    app.post(ApiPathPrefix + '/login', function (req, res, next) {
        UserService.authenticate(req, res, next);
    });

    app.post(ApiPathPrefix + '/logout', authController.logout);
};