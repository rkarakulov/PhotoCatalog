var config = require('config'),
    util = require('util');

config.app.db.getConnectionString = function() {
    var db = config.app.db;
    var dbPath = util.format('mongodb://%s:%d/%s', db.server, db.port, db.database);
    return dbPath;
}