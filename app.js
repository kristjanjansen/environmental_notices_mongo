express = require('express')
var mongo = require('mongodb').MongoClient;
var moment = require('moment')

app = express()

app.use(express.static(__dirname + '/public'))

app.get('/config', function(req, res){
  res.send({key: 'value'});
});
app.get('/api/week/:week', function(req, res){
  mongo.connect('mongodb://localhost:27017/exampleDb', function(err, db) {
    var collection = db.collection('test');
    var week = parseInt(req.params.week);
    var start = moment().week(week).startOf('week').add('days', 1).format()
    var end = moment().week(week).startOf('week').add('days', 8).format()
    collection.find({date: {$gte: start, $lt: end}}).toArray(function(err, items) {
      res.send({markers: items});
    });  
  })
});
app.get('/*', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(8001)