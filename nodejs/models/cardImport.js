var util = require('util');
var mongoose = require('mongoose');
var dateFormat = require('dateformat');
var CardSchema = require('./cardSchema');
var moment = require('moment');

// TODO: Create from model
CardSchema.statics.csvHeader = ['number', 'file', 'ps', 'pan', 'panString', 'id', 'code', 'fio', 'osb', 'terbank', 'printStatus',
    'printStatusHasError', 'shippingStatus', 'sourceId',
    'terbankAddress', 'shippingEnvelopeDateString', 'shippingCardDateString', 'deliveryDateString'];

CardSchema.methods.toCsvArray = function () {
    // TODO: Create from model
    return [this.number, this.file, this.ps, this.pan, this.panString, this.id, this.code, this.fio, this.osb,
        this.terbank, this.printStatus, this.printStatusHasError, this.shippingStatus, this.sourceId,
        this.terbankAddress, this.shippingEnvelopeDateString, this.shippingCardDateString, this.deliveryDateString];
}

CardSchema.methods.initializeByArray = function (row, terbankAddresses, shippingDates) {
    this.number = row[0];
    this.file = row[1]
    this.ps = row[2];
    this.pan = row[3];
    this.panString = util.format("'%s'", this.pan);
    this.id = row[4];
    this.code = row[5];
    this.fio = row[6];
    this.osb = row[7];
    this.terbank = row[8];

    var printStatusParseResults = {};
    this.printStatus = tryParsePrintStatus(row[9], printStatusParseResults);
    this.printStatusHasError = printStatusParseResults.hasError;

    this.shippingStatus = row[10];
    this.sourceId = row[11];
    this.terbankAddress = terbankAddresses[this.terbank] || null;

    var getShippingDatesResults = {};
    tryGetShippingDates(this.shippingStatus, shippingDates, getShippingDatesResults);
    this.shippingCardDateString = getShippingDatesResults.shippingCardDateString;
    this.shippingEnvelopeDateString = getShippingDatesResults.shippingEnvelopeDateString;

    //* *Ожидаемый срок доставки -> Дата (КАКАЯ? Пин конверты или карты?) передачи в DHL (Даты отгрузок) + N дней
    //(N зависит от ЦЭ. Таблицу соответствия «ЦЭ-N» предоставит банк.)*
    this.deliveryDateString = 'TODO';
}

function tryGetShippingDates(shippingStatus, shippingDates, /* out */ results) {
    if (!shippingStatus)
        return;

    var normalizedShippingStatus = shippingStatus.replace('см.', '').replace(' ', '');
    // Or use any available date
    var commonShippingDate = shippingDates.card[normalizedShippingStatus]
        || shippingDates.envelope[normalizedShippingStatus]
        || null;

    results.shippingCardDateString = shippingDates.card[normalizedShippingStatus] || commonShippingDate;
    results.shippingEnvelopeDateString = shippingDates.envelope[normalizedShippingStatus] || commonShippingDate;
}

function tryParsePrintStatus(str, /* out */ results) {
    results.hasError = false;

    var ticks = Date.parse(str);
    if (isNaN(ticks)) {
        if(str.indexOf('.') < 1) {
            results.hasError = true;
            return str;
        }
        else{
            return str;
        }
    }
    // If it is date - format it
    var date = new Date(ticks);
    return dateFormat(date, "dd.mm.yyyy");
}

module.exports = mongoose.model('CardImport', CardSchema, 'CardImport');