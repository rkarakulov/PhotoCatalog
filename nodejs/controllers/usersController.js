require('mongoose-query-paginate');
var User = require('../models/user.js');

exports.list = function (request, response) {
    User
        .find()
        .sort({ username: 1 })
        .paginate(request.query, function (err, result) {
            response.json({
                pages: result.pages,
                totalCount: result.count,
                results: result.results
            });
        });
}