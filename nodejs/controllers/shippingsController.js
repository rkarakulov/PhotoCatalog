require('mongoose-query-paginate');
var Shipping = require('../models/shipping.js');

exports.list = function (request, response) {
    Shipping
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