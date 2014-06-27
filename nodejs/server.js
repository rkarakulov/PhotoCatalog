var express     = require('express'),
    http        = require('http'),
    path        = require('path'),
    config      = require('./config/default.js'),
    passport    = require('passport'),
    log4js      = require('log4js'),
    https       = require('https'),
    mongoose    = require('mongoose'),
    fs          = require('fs');

var initializer = require('./init');

var connectToMongo = function () {
    mongoose.connect(config.app.db.getConnectionString(), config.app.db.options)
}

connectToMongo();

mongoose.connection.on('error', function (err) {
    console.log(err);
});

mongoose.connection.on('disconnected', function () {
    connectToMongo();
});

var app = express();

//config
log4js.configure({
    appenders: [
        { type: 'file', filename:  path.join(__dirname, 'logs/log4jsconnect.log') }
    ]
});
//define logger
var logger = log4js.getLogger('log4jslog');
app.use(log4js.connectLogger(logger, { level: log4js.levels.ALL }));

/*
process.chdir('/var/www/reestr/nodejs');
process.on('uncaughtException', function(err) {
    logger.error(err);
    setTimeout(function(){
        process.exit(1);
    }, 2000);
});*/

// all environments
app.set('port', process.env.PORT || config.app.port);
app.use(express.static(path.join(__dirname, config.app.staticDir)));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.app.cookieSecret));
app.use(express.bodyParser());
app.use(express.session({
    secret: config.app.cookieSecret
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

initializer.passport.init();
initializer.enums.init();

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

// Socket.io Communication
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
    var routes = require('./routes');
    routes.init(app, socket);
});

/*var options = {
    key: fs.readFileSync(path.join(__dirname, '../httpd-cert/reestr.plat-sys.com.key')),
    cert: fs.readFileSync(path.join(__dirname, '../httpd-cert/reestr.plat-sys.com.crt'))
};

https.createServer(options, app).listen(app.get('port'), function (req, res) {
    console.log('Express server listening on port ' + app.get('port'));
});*/
