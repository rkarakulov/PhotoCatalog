var profileController = require('../controllers/profileController'),
    templateController = require('../controllers/templateController'),
    UserService = require('../services/userService'),
    authRoutes = require('./authRoutes'),
    resetPasswordRoutes = require('./resetPasswordRoutes'),
    profileRoutes = require('./profileRoutes'),
    sessionRoutes = require('./sessionRoutes'),
    sessionContentRoutes = require('./sessionContentRoutes'),
    sessionInviteRoutes = require('./sessionInviteRoutes');

var organizerAuthRoutes = require('./organizer/authRoutes'),
    organizerEventRoutes = require('./organizer/eventRoutes');

exports.init = function (app) {
    app.get('/', profileController.index);

    authRoutes(app);
    resetPasswordRoutes(app);
    profileRoutes(app);
    sessionRoutes(app);
    sessionContentRoutes(app);
    sessionInviteRoutes(app);

    organizerAuthRoutes(app);
    organizerEventRoutes(app);

    app.get('/:userAlias', profileController.publicProfile);
    app.get('/templates/:id*', templateController.index);
}

