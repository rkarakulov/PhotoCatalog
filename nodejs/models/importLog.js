var mongoose = require('mongoose');

var ImportLogSchema = new mongoose.Schema({
    date: Date,
    registryCount: Number,
    shippingCount: Number,
    terbankCount: Number,
    importFileName: String
});

ImportLogSchema.methods.initializeByCounts = function (registryCount, shippingCount, importFileName) {
    this.date = new Date();
    this.registryCount = registryCount;
    this.shippingCount = shippingCount;
    this.terbankCount = 0;
    this.importFileName = importFileName;
}

module.exports = mongoose.model('ImportLog', ImportLogSchema, 'ImportLog');