express = require('express')
var mongo = require('mongodb').MongoClient;

app = express()

app.use(express.static(__dirname + '/public'))

app.get('/config', function(req, res){
  res.send({key: 'value'});
});
app.get('/api/data/:page', function(req, res){
  mongo.connect('mongodb://localhost:27017/exampleDb', function(err, db) {
    var collection = db.collection('test');
    collection.find({page: parseInt(req.params.page)}).toArray(function(err, items) {
      res.send({markers: items});
    });  
  })
}); // req.params.page
app.get('/*', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.listen(8001)