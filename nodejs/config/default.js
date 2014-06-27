var util = require('util');

module.exports = {
    app: {
        cookieSecret: "FkmdYT@Txcm^g8-s",
        version: "1.0.0.0",
        db: {
            server: 'localhost',
            port: 27017,
            database: 'OnlineRegistryDb',
            options: {
                server: {
                    socketOptions: {
                        keepAlive: 1
                    }
                }
            },
            getConnectionString: function() {
                var db = {
                    server: 'localhost',
                    port: 27017,
                    database: 'OnlineRegistryDb'
                };
                var dbPath = util.format('mongodb://%s:%d/%s', db.server, db.port, db.database);
                return dbPath;
            }
        },
        staticDir: '../html',
        port: 8003,
        deniedAliases: ['login', 'logout'],
        attempts: {
            maxCount: 3,
            cookieName: 'orattempts',
            maxAgeInMilliseconds: 300000
        },
        captcha: {
            cookieName: 'orcaptcha',
            maxAgeInMilliseconds: 604800000
        },
        rememberPassword: {
            maxAgeInMilliseconds: 604800000, // 7 days
            cookieName: 'token'
        }
    }
};