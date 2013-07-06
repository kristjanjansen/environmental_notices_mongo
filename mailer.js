var config = require("config");
var nodemailer = require("nodemailer");
var moment = require("moment");
var mongo = require('mongodb').MongoClient;
var hogan = require('hogan.js');


var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.mailUsername,
        pass: config.mailPassword
    }
});


mongo.connect(config.mongoUrl, function(err, db) {
  if (err) throw err;
  var collection = db.collection(config.mongoCollection);

  var week = moment().subtract('weeks', 1).week()
  var start = moment().week(week).startOf('week').add('days', 1)
  var end = moment().week(week).startOf('week').add('days', 8)
  
  var tmpl = '\
    {{#items}}\
    <b>{{type}}</b><br />\
    Link: http://keskkonnateated.ee/{{week}}/{{id}}<br />\
    {{date}}<br />\
    Allikas: {{url}}<br />\
    <br />\
    {{description}}<br />\
    <br />\
    <br />\
    {{/items}}\
    ---<br />\
    <br />\
    Keskkonnateated<br />\
    http://keskkonnateated.ee<br />\
    keskkonnateated@gmail.com\
  '
    
  collection.find({date: {$gte: start.format(), $lt: end.format()}, priority: {$ne: 0}}).sort({priority: -1, type: 1 }).toArray(function(err, items) {
    if (err) throw err;

    var mailOptions = {
      from: config.mailFrom,
      to: config.mailTo, 
      subject: 'Test: Keskkonnateated ' + start.format('DD.MM.YYYY') + ' - ' + end.subtract('days', 1).format('DD.MM.YYYY'),
      html: hogan.compile(tmpl).render({items: items})
    }

  console.log('Sent mail')
  //db.close()
  
  /*
  smtpTransport.sendMail(mailOptions, function(err, res) {
      if (err) {
        throw err
      } else {
        console.log("Message sent: " + res.message);
      }
      smtpTransport.close();
  });
  */

  })
  
});
