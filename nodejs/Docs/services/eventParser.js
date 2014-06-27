var async = require('async'),
    util = require('util'),
    XLSX = require('xlsx-extract').XLSX,
    validator = require('validator');

var Parser = function () {
    var self = this;
    self.items = [];
    self.validationErrors = [];

    self.readFile = function (filePath, callback) {
        self.eventName = null;
        new XLSX().extract(filePath, {
            sheet_nr: 1,
            ignore_header: 1
        })
            .on('row', function (row) {
                if (self.eventName) self.eventName = row[0];
                var viewModel = self.getViewModel(row);
                if(viewModel.isEmpty()) return;

                if (!viewModel.isValid()) {
                    self.validationErrors.push(util.format("file contains inconsistent data in row: %j", row));
                    return;
                }

                self.items.push(viewModel);
            })
            .on('error', function (err) {
                return callback(err);
            })
            .on('end', function(){
                if (self.validationErrors.length > 0) {
                    callback({ message: self.validationErrors.join('\n') })
                    return;
                }

                callback(null, self.items);
            });
    }

    self.getViewModel = function (row) {
        var eventSessionViewModel = new EventSessionViewModel();
        eventSessionViewModel.eventName = row[0];
        eventSessionViewModel.sessionName = row[1];
        eventSessionViewModel.sessionId = row[2];
        eventSessionViewModel.speakerFirstName = row[3];
        eventSessionViewModel.speakerLastName = row[4];
        eventSessionViewModel.speakerPhone = row[5];
        eventSessionViewModel.speakerEmail = row[6];
        eventSessionViewModel.startDate = row[7];
        eventSessionViewModel.duration = row[8];
        eventSessionViewModel.description = row[9];

        return eventSessionViewModel;
    }
}

var EventSessionViewModel = function () {
    var self = this;
    self.getStartDate = function () {
        return new Date(self.startDate);
    }

    self.getEndDate = function () {
        return new Date(self.startDate) + (60 * self.duration);
    }

    self.isValid = function () {
        var isValid =
            !validator.isNull(self.eventName)
                && !validator.isNull(self.sessionName)
                && !validator.isNull(self.speakerFirstName)
                && !validator.isNull(self.speakerLastName)
                && !validator.isNull(self.speakerEmail)
                && validator.isEmail(self.speakerEmail)
                && !validator.isNull(self.startDate)
                && validator.isDate(self.startDate)
                && !validator.isNull(self.duration)
                && validator.isFloat(self.duration)
                && !validator.isNull(self.description);

        return isValid;
    }

    self.isEmpty = function(){
        return !self.sessionName
                && !self.speakerFirstName
                && !self.speakerLastName
                && !self.speakerEmail
                && !self.startDate
                && !self.duration
                && !self.description;
    }
}

exports.parser = Parser;