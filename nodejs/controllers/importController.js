require('mongoose-query-paginate');
var ImportLog = require('../models/importLog.js'),
    importService = require('../services/importService'),
    fs = require('fs'),
    async = require('async'),
    underscore = require('underscore'),
    mongoose = require('mongoose'),
    config = require('../config/default.js'),
    dateFormat = require('dateformat'),
    path = require('path');

// perPage: 10, // Number of items to display on each page.
// delta  :  5, // Number of page numbers to display before and after the current one.
// page   :  1, // Initial page number.
// offset :  0  // Offset number.
exports.list = function (request, response) {
    ImportLog
        .find()
        .sort({ date: -1 })
        .paginate(request.query, function (err, result) {
            response.json({
                pages: result.pages,
                totalCount: result.count,
                results: result.results
            });
        });
}

exports.getLastImport = function (request, response) {
    var query = ImportLog.find().sort({ _id: -1 }).limit(1);
    query.exec(function (err, docs) {
        var lastImportLog = null;
        if (docs && docs.length > 0)
            lastImportLog = docs[0];
        return response.send({
            lastImportLog: lastImportLog
        });
    });
};

exports.upload = function (request, response) {
    //var fileName = getSaveFileName(UploadTypes[request.files.uploadData.type]);
    var fileName = getSaveFileName("xlsx");
    var savePath = getSavePath(fileName);
    saveFile(request.files.uploadData.path, savePath);

    return response.send({
        'success': true,
        'fileName': fileName
    });
}

exports.import = function (request, response, socket) {
    var fileName = request.body.fileName;
    var savePath = getSavePath(fileName);

    mongoose.connect(config.app.db.getConnectionString());
    mongoose.connection.on('error', function (err) {
        console.log('Mongo connection error: ' + err);
    })

    async.waterfall([
            function (next) {
                importService.prepareShippingData(savePath, next);
            }
            , function (next) {
                importService.prepareData(savePath, socket, next);
            }
            , function (newOrders, next) {

                // Check new orders: assign some date
                var newOrdersWithDates = [];
                /*            underscore.each(newOrders, function(value) {
                 newOrdersWithDates.push({
                 code: value,
                 date: new Date()
                 });
                 });*/

                next(null, newOrdersWithDates);
            }
            , function (newOrdersWithDates, next) {
                var folderPath = path.resolve(__dirname + '/../' + config.app.staticDir + '/uploads/');
                ClearUploadedFiles(folderPath, fileName);

                var curDate = new Date();
                var newFileName = dateFormat(curDate, "yyyy-mm-dd") + ".xlsx";
                try {
                    fs.renameSync(folderPath + "/" + fileName, folderPath + "/" + newFileName);
                }
                catch (err) {
                    console.log('Error: ', err);
                }

                importService.applyData(newOrdersWithDates, next, newFileName);
            }
        ],
        function (err, result) {
            if (err) {
                console.log('Error: ', err);
                response.json({ 'error': err });
            }

            mongoose.disconnect();


            response.json({ 'success': true });
        });
}

function ClearUploadedFiles(folderPath, fileName) {
    try {
        var files = fs.readdirSync(folderPath);
        files.forEach(function (file) {
            if (file != fileName) {
                fs.unlink(folderPath + '/' + file);
            }
        });
    }
    catch (err) {
        console.log('Error: ', err);
    }
}

function saveFile(path, savePath) {
    var fileData = fs.readFileSync(path);
    fs.writeFileSync(savePath, fileData);
}

function getSaveFileName(extension) {
    return new Date().getTime() + '.' + extension;
}

function getSavePath(fileName) {
    var p = path.resolve(__dirname + '/../' + config.app.staticDir + '/uploads/' + fileName);
    return p;
}

var UploadTypes = {
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats": "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx"
};
