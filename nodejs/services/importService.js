var async = require('async');
var mongoose = require('mongoose');
var dateFormat = require('dateformat');
var underscore = require('underscore');
var xslx = require('xlsx-extract').XLSX;
var csv = require('ya-csv');
var childProcess = require('child_process');

var config = require('../config/default.js');

var Card = require('../models/card.js');
var CardImport = require('../models/cardImport.js');
var Terbank = require('../models/terbank.js');
var Shipping = require('../models/shipping.js');
var ImportLog = require('../models/importLog.js');

var DefaultParserParameters = {
    sheet_nr: 1,
    ignore_header: 1
};

var DefaultDateFormat = 'dd.mm.yyyy';

function prepareShippingCsv(csvFilePath, xslxFilePath, callback) {
    var writer = csv.createCsvFileWriter(csvFilePath);
    writer.on('close', function () {
        callback(null);
    });

    writer.writeRecord(Shipping.csvHeader);

    var model = new Shipping();

    var parser = new xslx();
    DefaultParserParameters.sheet_nr = 2;
    parser.extract(xslxFilePath, DefaultParserParameters)
        .on('row', function (row) {
            try {
                model.initializeByArray(row);
                writer.writeRecord(model.toCsvArray());
            } catch (err) {
                callback(err);
            }
        })
        .on('error', function (err) {
            handleCallback(callback, null, err);
            //console.error(err);
        })
        .on('end', function (err) {
            writer.writeStream.end();
        });
}

function prepareCsv(csvFilePath, xslxFilePath, terbanks, shippings, socket, callback) {
    var writer = csv.createCsvFileWriter(csvFilePath);
    writer.on('close', function () {
        callback(null);
    });
    writer.writeRecord(CardImport.csvHeader);

    var extractedRowsCount = 0;
    var isExtractEnd = false;
    var sendPercent = setInterval(function () {
        socket.broadcast.emit('parseStatus', {
            extractedRowsCount: extractedRowsCount
        });
        if (isExtractEnd) {
            clearInterval(sendPercent);
            isExtractEnd = false;
        }
    }, 1000);

    var model = new CardImport();
    var parser = new xslx();
    DefaultParserParameters.sheet_nr = 1;
    parser.extract(xslxFilePath, DefaultParserParameters)
        .on('row', function (row) {
            try {
                model.initializeByArray(row, terbanks, shippings);
                writer.writeRecord(model.toCsvArray());
                extractedRowsCount += 1;
            } catch (err) {
                callback(err);
            }
            // Progress
            //process.stdout.write('.');
        })
        .on('error', function (err) {
            handleCallback(callback, null, err);
            //console.error(err);
        })
        .on('end', function (err) {
            writer.writeStream.end();
            isExtractEnd = true;
            socket.broadcast.emit('endParse', {
                extractedRowsCount: 0
            });
        });
}

function importCsv(filePath, modelName, callback) {
    // Call mongoimport
    var mongoimportPath = 'mongoimport';
    var args = [
        '--host', config.app.db.server,
        '--port', config.app.db.port,
        '--db', config.app.db.database,
        '--collection', modelName,
        '--type', 'csv',
        '--file', filePath,
        '--headerline',
        '--ignoreBlanks'
    ];

    var process = childProcess.spawn(mongoimportPath, args)

    var errors = [];
    process.stderr.on('data', function (data) {
        errors.push(data);
    });

    process.on('error', function (data) {
        // Just stub. Required for error handing.
    });

    process.on('close', function (code) {
        if (parseInt(code) > 0) {
            callback(new Error(errors.toString()));
        } else {
            callback(null);
        }
    });
}

function getTerbankAddresses(callback) {
    Terbank.find(function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var terbankAddresses = {};
        result.forEach(function (element, index, array) {
            terbankAddresses[element.code] = element.address;
        });

        callback(null, terbankAddresses);
    });
}

function getShippingDates(callback) {
    Shipping.find(function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        var cardShippingDates = {};
        var envelopeShippingDates = {};
        result.forEach(function (element, index, array) {
            var formattedDate = dateFormat(element.date, DefaultDateFormat);

            if (element.title.toLowerCase().indexOf('пин') > -1)
                envelopeShippingDates[element.code] = formattedDate;
            else
                cardShippingDates[element.code] = formattedDate;
        });

        callback(null, {
            card: cardShippingDates,
            envelope: envelopeShippingDates
        });
    });
}

function getNewOrders(callback) {
    async.parallel({
            currentStatuses: function (next) {
                Card.find().distinct('shippingStatus', function (err, result) {
                    handleCallback(next, null, err, result);
                });
            },
            newStatuses: function (next) {
                CardImport.find().distinct('shippingStatus', function (err, result) {
                    handleCallback(next, null, err, result);
                });
            }
        },
        function (err, results) {
            if (err) {
                callback(err);
                return;
            }

            var newOrders = underscore.difference(results.newStatuses, results.currentStatuses);
            callback(null, newOrders);
        });
}

function updateNewCardOrders(ordersWithDates, callback) {
    async.forEach(ordersWithDates, function (order, loopCallback) {
        var formattedDate = dateFormat(order.date, DefaultDateFormat);

        CardImport.update({
                shippingStatus: order.code
            },
            {
                shippingCardDateString: formattedDate,
                shippingEnvelopeDateString: formattedDate
            },
            {
                multi: true
            },
            function (err, numberAffected, raw) {
                var onBeforeCallback = function () {
                    console.log('The number of updated cards was %d', numberAffected);
                };

                handleCallback(loopCallback, onBeforeCallback, err);
            }
        );
    }, callback);
}

function updateImportLog(callback, importFileName) {
    async.parallel({
            cardCount: function (next) {
                Card.count(function (err, result) {
                    handleCallback(next, null, err, result);
                });
            },
            shippingCount: function (next) {
                Shipping.count(function (err, result) {
                    handleCallback(next, null, err, result);
                });
            },
        },
        function (err, results) {
            if (err) {
                callback(err);
                return;
            }

            var model = new ImportLog();
            model.initializeByCounts(results.cardCount, results.shippingCount, importFileName);
            model.save(function (err, item, numberAffected) {
                var onBeforeCallback = function () {
                    console.log('New importLog:', item);
                };
                handleCallback(callback, onBeforeCallback, err, results);
            });
        });
}

function moveCardImportToCard(callback) {
    CardImport.collection.rename(Card.modelName, { dropTarget: true }, function (err, collection) {
        var onBeforeCallback = function () {
            console.log('Card collections replaced');
        };
        handleCallback(callback, onBeforeCallback, err);
    });
}

function updateShipping(ordersWithDates, callback) {
    async.forEach(ordersWithDates, function (order, loopCallback) {
        var shipping = new Shipping();
        shipping.initializeByOrder(order)
        shipping.save(function (err, item, numberAffected) {
            var onBeforeCallback = function () {
                console.log('New shipping:', item);
            };

            handleCallback(loopCallback, onBeforeCallback, err);
        });
    }, callback);
}

function handleCallback(callback, onBeforeCallback, err /* results as parameters */) {
    if (err) {
        callback(err);
        return;
    }

    if (onBeforeCallback)
        onBeforeCallback();

    var args = [].slice.call(arguments, 2);

    // Call callback with arguments except 'callback' and 'onBeforeCallback'
    callback.apply(null, args);
}

module.exports = {
    prepareShippingData: function (xslxFilePath, callback) {
        var tempShippingCsvFilePath = 'shipping.csv';

        async.waterfall([
                function (next) {
                    prepareShippingCsv(tempShippingCsvFilePath, xslxFilePath, next);
                }
                , function (next) {
                    // Clear Shipping before import
                    Shipping.remove(function (err) {
                        next(err);
                    });
                }
                , function (next) {
                    importCsv(tempShippingCsvFilePath, Shipping.modelName, next);
                }
            ],
            function (err) {
                callback(err);
            });
    },

    prepareData: function (xslxFilePath, socket, callback) {
        var tempCsvFilePath = 'result.csv';

        async.parallel({
                terbankAddresses: function (next) {
                    getTerbankAddresses(next);
                },
                shippingDates: function (next) {
                    getShippingDates(next);
                }
            },
            function (err, results) {
                async.waterfall([
                        function (next) {
                            prepareCsv(tempCsvFilePath, xslxFilePath, results.terbankAddresses, results.shippingDates, socket, next);
                        }
                        , function (next) {
                            // Clear CardImport before import
                            CardImport.remove(function (err) {
                                next(err);
                            });
                        }
                        , function (next) {
                            importCsv(tempCsvFilePath, CardImport.modelName, next);
                        }
                        , function (next) {
                            getNewOrders(next); // New orders passes to result.newOrders
                        }
                    ],
                    function (err, result) {
                        callback(err, result);
                    });
            }
        );
    },

    applyData: function (ordersWithDates, callback, importFileName) {
        async.waterfall([
                function (next) {
                    updateNewCardOrders(ordersWithDates, next);
                },
                function (next) {
                    moveCardImportToCard(next);
                },
                function (next) {
                    updateShipping(ordersWithDates, next);
                },
                function (next) {
                    updateImportLog(next, importFileName);
                }
            ],
            function (err, result) {
                handleCallback(callback, null, err, result);
            });
    }
}