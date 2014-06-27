var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('config'),
    passport = require('passport'),
    Bliss = require('bliss'),
    MongoStore = require('connect-mongo')(express);

var routes = require('./routes');
var initializer = require('./init');

require('./extentions');

initializer.mongoose.init();

var app = express();

var bliss = new Bliss({
    ext: ".html",
    cacheEnabled: false,
    context: {}
});

app.engine('html', function (path, options, fn) {
    fn(null, bliss.render(path, options));
});
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));


// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.app.cookieSecret));
app.use(express.session({
    secret: config.app.cookieSecret,
    store: new MongoStore({
        host: config.app.db.host,
        db: config.app.db.database,
        port: config.app.db.port
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

app.use(app.router);
routes.init(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

initializer.passport.init();
initializer.passreset.init();
initializer.enums.init();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
