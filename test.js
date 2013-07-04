var mongo = require('mongodb').MongoClient
var moment = require('moment')

mongo.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  
  if (err) { throw err }

  var collection = db.collection('test');
  collection.remove(function() {});
  
  var data = [
        {page: 1, title: 'Place A', coords: [58.58,25.1], date: new moment().subtract('days', 3).format()},
        {page: 1, title: 'Place B', coords: [58.8,25.5], date: new moment().subtract('day', 3).format()},
        {page: 2, title: 'Place D', coords: [58.18,24.1], date: new moment().subtract('days', 2).format()},
        {page: 2, title: 'Place E', coords: [58.9,25.3], date: new moment().subtract('days', 2).format()},
        {page: 3, title: 'Place F', coords: [57.98,24.1], date: new moment().subtract('days', 1).format()},
        {page: 3, title: 'Place G', coords: [57.96,25.3], date: new moment().subtract('days', 1).format()}
    ]
      
  collection.insert(data, {w:1}, function(err, result) {
    console.log(result)
  });

});