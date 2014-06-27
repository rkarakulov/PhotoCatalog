require('mongoose-query-paginate');
var Terbank = require('../models/terbank.js');

exports.list = function (request, response) {
    Terbank
        .find()
        .sort({ code: 1 })
        .paginate(request.query, function (err, result) {
            response.json({
                pages: result.pages,
                totalCount: result.count,
                results: result.results
            });
        });
}