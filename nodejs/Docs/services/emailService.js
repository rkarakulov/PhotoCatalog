var config = require('config'),
    nodemailer = require('nodemailer'),
    Bliss = require('bliss');

exports.send = function(to, subject, templatePath, context, callback){

    var text = compileTemplate(templatePath+".text", context);
    var html = compileTemplate(templatePath, context);

    var mailOptions = {
        from: config.app.email.from,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    createTransport().sendMail(mailOptions, function(err, response){
        callback(err, response);
    });
}

function compileTemplate(templatePath, context){
    var bliss = new Bliss({
        ext: ".html",
        cacheEnabled: true,
        context: {}
    });
    return bliss.compileFile(templatePath)(context);
}

function createTransport(){
    return nodemailer.createTransport("SMTP",{
        host: config.app.email.host,
        port: config.app.email.port,
        secureConnection: config.app.email.secureConnection,
        auth: {
            user: config.app.email.user,
            pass: config.app.email.password
        }
    });

}