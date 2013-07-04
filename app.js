config = require('config')
express = require('express')
var mongo = require('mongodb').MongoClient;
var moment = require('moment')

app = express()

app.use(express.static(__dirname + '/public'))

app.get('/config', function(req, res){
  res.send({});
});

app.get('/api/week/:week', function(req, res){
  mongo.connect(config.mongoUrl, function(err, db) {
    if (err) throw err;
    var collection = db.collection(config.mongoCollection);
    var week = parseInt(req.params.week);
    var start = moment().week(week).startOf('week').add('days', 1).format()
    var end = moment().week(week).startOf('week').add('days', 8).format()
    // @TODO: filter out priority 0
    collection.find({date: {$gte: start, $lt: end}}).sort({priority: -1, type: 1 }).toArray(function(err, items) {
      res.send({markers: items});
    });  
  })
});

app.get('/*', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(8001)