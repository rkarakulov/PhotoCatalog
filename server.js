var express     = require('express');

var app = express();

app.set('port', process.env.PORT || 8003);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


