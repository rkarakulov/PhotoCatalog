var async = require('async');
var mongoose = require('mongoose');
var util = require('util');
var config = require('../../../config/default.js');
config.app.db.getConnectionString = function() {
    var db = config.app.db;
    var dbPath = util.format('mongodb://%s:%d/%s', db.server, db.port, db.database);
    console.log(dbPath);
    return dbPath;
}


var importService = require('../../../services/importService');

mongoose.connect(config.app.db.getConnectionString());
mongoose.connection.on('error', function (err) {
    console.log('Mongo connection error: ' + err);
})

async.waterfall([
    function(next) {
        importService.prepareShippingData('Card.xlsx', next);
    }
    ,function(next) {
        importService.prepareData('Card.xlsx', next); 
    }
    , function(newOrders, next) {
        // Use empty array here, since it is initial import 
        var newOrdersWithDates = [];
        next(null, newOrdersWithDates);
    }
    , function (newOrdersWithDates, next) {
        importService.applyData(newOrdersWithDates, next);
    }
], 
function(err, result) {
    if (err) {
        console.log('Error: ', err);
    }
    
    mongoose.disconnect(); 
});