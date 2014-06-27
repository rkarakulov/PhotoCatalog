var mongoose = require('mongoose');
var CardSchema = require('./cardSchema');

module.exports = mongoose.model('Card', CardSchema, 'Card');