var mongoose = require('mongoose');

var CardSchema = new mongoose.Schema({
    number: Number,
    file: String,
    ps: String,
    pan: Number,
    // Mongoimport converts PAN value to number automatically. In that case it is impossible to search by this field.
    // Force convert value to string here.
    panString: String,
    id: String,
    code: String,
    fio: String,
    osb: String,
    terbank: String,
    printStatus: String,
    printStatusHasError: String, // TODO: should be bool here
    shippingStatus: String,
    sourceId: String,

    // Custom fields
    terbankAddress: String,
    shippingEnvelopeDateString: String, // TODO: should be date here
    shippingCardDateString: String, // TODO: should be date here
    deliveryDateString: String // TODO: should be date here
});

module.exports = CardSchema;