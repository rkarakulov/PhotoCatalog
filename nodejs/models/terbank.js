var mongoose = require('mongoose');

var TerbankSchema = new mongoose.Schema({
    code: String,
    title: String,
    cityName: String,
    address: String
});

module.exports = mongoose.model('Terbank', TerbankSchema, 'Terbank');