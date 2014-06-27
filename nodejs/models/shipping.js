var mongoose = require('mongoose');

var ShippingSchema = new mongoose.Schema({
    code: String,
    title: String,
    date: Date
});

// TODO: Create from model
ShippingSchema.statics.csvHeader = ['code', 'title', 'date'];

ShippingSchema.methods.toCsvArray = function () {
    // TODO: Create from model
    return [this.code, this.title, this.date];
}

ShippingSchema.methods.initializeByOrder = function (order) {
    this.code = order.code;
    this.title = "Москва и регионы";
    this.date = order.date;
}

ShippingSchema.methods.initializeByArray = function (row) {
    this.code = row[0];
    this.title = row[1]
    this.date = row[2];
}

module.exports = mongoose.model('Shipping', ShippingSchema, 'Shipping');