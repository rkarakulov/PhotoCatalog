require('mongoose-query-paginate');
var _ = require('underscore');
var captchapng = require('captchapng');
var Card = require('../models/card.js');
var ImportLog = require('../models/importLog.js');
var config      = require('../config/default.js');
var dateFormat = require('dateformat');
var moment = require('moment');
var path = require('path');

Date.prototype.addDays = function (dayOffset) {
    var millisecondOffset = dayOffset * 24 * 60 * 60 * 1000;
    this.setTime(this.getTime() + millisecondOffset);
}

exports.search = function (request, response) {
    var query = Card.find();

    var searchFilter = request.query.search;
    if (!searchFilter || searchFilter.length < 4) {
        response.json({
            totalCount: 0,
            results: []
        });

        return;
    }

    var searchFilterRegex = new RegExp(searchFilter, 'i');
    query = query.or([
        { id: { $regex: searchFilterRegex }},
        { fio: { $regex: searchFilterRegex }},
        { panString: { $regex: searchFilterRegex }}
    ])

    query.paginate(request.query, function (err, result) {
        response.json({
            totalCount: result.count,
            results: result.results
        });
    });
}

exports.report = function (request, response) {
    var query = Card.find();

    var printStatusFilter = request.query.printStatus;
    if (!printStatusFilter || printStatusFilter.length == 1) {
        var query = Card.find({ printStatusHasError: 'true' });
    } else {
        var printStatusFilterRegex = new RegExp(['^', printStatusFilter, '$'].join(''), 'i'); // Ignore case
        var query = Card.find({ printStatus: printStatusFilterRegex });
    }

    query.paginate(request.query, function (err, result) {
        response.json({
            totalCount: result.count,
            results: result.results
        });
    });
}

exports.printStatuses = function (request, response) {
    Card.distinct('printStatus', { printStatusHasError: 'true' }, function (err, result) {
        var normalizedResult = _.uniq(result, false,
            function (item) {
                // Filter items with ignorecase way
                return item.toLowerCase()
            });

        response.json(_.sortBy(normalizedResult));
    });
}

exports.searchClient = function (request, response) {
    var clientId = request.query.id;
    var clientCaptcha = request.query.captcha;

    if(clientCaptcha == request.cookies[config.app.captcha.cookieName]){
        Card.find({
                id: clientId
            },
            function (err, result) {
                var offset = 14; // пока всем ставим коэфициент 14
                /*
                 [15:23:24] Mr.Anderson: смотрим ЦЭ, смотрим по ЦЭ срок доставки до него, прибавляем  к дате отправки
                 [15:23:24] Mr.Anderson: таблицы "ЦЭ-сроки" у нас еще нет пока можно заполнить 14 дней на все ЦЭ
                */

                var resultList = [];
                for(var i=0; i < result.length; i++) {
                    if(result[i].shippingStatus && result[i].shippingStatus.indexOf("Заказ") === 0) {
                        var date = moment(result[i].shippingCardDateString, "DD.MM.YYYY");
                        date = date.add('days', offset);
                        result[i].deliveryDateString = date.format("DD.MM.YYYY");

                        resultList.push(result[i]);
                    }
                }

                response.jsonp(resultList);
            }
        );
    }
    else{
        response.jsonp({
            status: 500,
            errors: ['Неверная captcha']
        });
    }
}

exports.client = function(request, response){
    var htmlPath = path.resolve(__dirname + '/../views/client.html')
    response.sendfile(htmlPath);
};

exports.captcha = function(request, response, next) {
    var number = parseInt(Math.random()*9000+1000);
    var p = new captchapng(80,30, number); // width,height,numeric captcha

    response.cookie(config.app.captcha.cookieName, number, {
        path: '/api/cards/searchClient',
        httpOnly: true,
        maxAge: config.app.captcha.maxAgeInMilliseconds
    });

    p.color(36, 128, 29, 0);  // First color: background (red, green, blue, alpha)
    p.color(36, 128, 29, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    response.writeHead(200, {
        'Content-Type': 'image/png'
    });
    response.end(imgbase64);
}

var getIp = function(request) {
    return request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress;
}
