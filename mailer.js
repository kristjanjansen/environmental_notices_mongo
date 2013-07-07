var config = require("config");
var nodemailer = require("nodemailer");
var moment = require("moment");
var mongo = require('mongodb').MongoClient;
var hogan = require('hogan.js');
var cron = require('cron').CronJob;
   
var job = new cron(config.mailCron, function() {

  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: config.mailUsername,
          pass: config.mailPassword
      }
  });

    var tmpl = '\
  {{#items}}\
  <b>{{type}}</b><br />\
  {{date}}<br />\
  http://keskkonnateated.ee/{{week}}/{{id}}<br />\
  <br />\
  {{{description}}}<br />\
  <br />\
  Allikas: {{url}}<br />\
  <br />\
  <br />\
  {{/items}}\
  ---<br />\
  <br />\
  Keskkonnateated<br />\
  http://keskkonnateated.ee<br />\
  keskkonnateated@gmail.com\
  '

  mongo.connect(config.mongoUrl, function(err, db) {
    if (err) throw err;
    var collection = db.collection(config.mongoCollection);

    var week = moment().subtract('weeks', 1).week()
    var start = moment().week(week).startOf('week').add('days', 1)
    var end = moment().week(week).startOf('week').add('days', 8)
    
    collection.find({date: {$gte: start.format(), $lt: end.format()}, priority: {$ne: 0}}).sort({priority: -1, type: 1 }).toArray(function(err, items) {
      if (err) throw err;
    
      items = items.map(function(item) {
        item.date = moment(item.date).format('DD.MM.YYYY')
        item.week = week
        return item
      })
    
      var mailOptions = {
        from: config.mailFrom,
        to: config.mailTo, 
        subject: 'Test2: Keskkonnateated ' + start.format('DD.MM.YYYY') + ' - ' + end.subtract('days', 1).format('DD.MM.YYYY'),
        html: hogan.compile(tmpl).render({items: items})
      }
  
    smtpTransport.sendMail(mailOptions, function(err, res) {
        if (err) {
          throw err
        } else {
          console.log(moment().format() + ' Completed mailer: ' + res.message);
        }
        smtpTransport.close();
        db.close()
      
    });
  

    })
  
  });
  
}).start();
