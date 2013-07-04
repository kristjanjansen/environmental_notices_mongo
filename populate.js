var mongo = require('mongodb').MongoClient
var moment = require('moment')

mongo.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  
  if (err) { throw err }

  var collection = db.collection('test');
  collection.remove(function() {});
  
  var data = [
        {id: 1, title: 'Place A', description: 'Lorem Ipsum bla bla bla', coords: [58.58,25.1], date: new moment().subtract('weeks', 2).format()},
        {id: 2, title: 'Place B', description: 'Lorem Ipsum bla bla bla',  coords: [58.8,25.5], date: new moment().subtract('weeks', 2).format()},
        {id: 3, title: 'Place D', description: 'Lorem Ipsum bla bla bla',  coords: [58.18,24.1], date: new moment().subtract('week', 1).format()},
        {id: 4, title: 'Place E', description: 'Lorem Ipsum bla bla bla',  coords: [58.9,25.3], date: new moment().subtract('week', 1).format()},
        {id: 5, title: 'Place F', description: 'Lorem Ipsum bla bla bla',  coords: [57.98,24.1], date: new moment().format()},
        {id: 6, title: 'Place G', description: 'Lorem Ipsum bla bla bla',  coords: [57.96,25.3], date: new moment().format()}
    ]
      
  collection.insert(data, {w:1}, function(err, result) {
    console.log(result)
    db.close()
  });

});