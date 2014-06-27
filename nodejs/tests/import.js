var async = require('async');
var underscore = require('underscore');
var mongoose = require('mongoose');
var config = require('../config/default.js');

var importService = require('../services/importService');

mongoose.connect(config.app.db.getConnectionString());
mongoose.connection.on('error', function (err) {
    console.log('Mongo connection error: ' + err);
})

async.waterfall([
    function(next) {
        importService.prepareShippingData('data.xlsx', next);
    },
    function(next) {
        importService.prepareData('data.xlsx', next); 
    }
    , function(newOrders, next) {
        console.log('New orders:', newOrders);
        
        // Check new orders: assign some date
        var newOrdersWithDates = [];
        underscore.each(newOrders, function(value) {
            newOrdersWithDates.push({
                code: value,
                date: new Date(),
            });
        });
        
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