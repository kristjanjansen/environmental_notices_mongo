express = require('express')
var mongo = require('mongodb').MongoClient;
var moment = require('moment')

app = express()

app.use(express.static(__dirname + '/public'))

app.get('/config', function(req, res){
  res.send({key: 'value'});
});
app.get('/api/data/:page', function(req, res){
  mongo.connect('mongodb://localhost:27017/exampleDb', function(err, db) {
    var collection = db.collection('test');
    var page = parseInt(req.params.page);
    var start = moment().subtract('days', page).hour(0).format()
    var end = moment().subtract('days', page).hour(24).format()
    collection.find({date: {$gte: start, $lt: end}}).toArray(function(err, items) {
      res.send({markers: items});
    });  
  })
}); // req.params.page
app.get('/*', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(8001)