var mongo = require('mongodb').MongoClient
var moment = require('moment')

mongo.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  
  if (err) { throw err }

  var collection = db.collection('test');
  collection.remove(function() {});
  
  var data = [
        {
          id: 1, 
          title: 'Place A', 
          description: 'Lorem Ipsum bla bla bla', 
          type: 'Water well', 
          priority: 1, 
          geom: {"type":"Point","coordinates":[22.69422358,59.07116279]}, 
          date: new moment().subtract('weeks', 2).format()
        },
        {
          id: 2, 
          title: 'Place B', 
          description: 'Lorem Ipsum bla bla bla', 
          type: 'Some pump', 
          priority: 1, 
          geom: {"type":"Point","coordinates":[26.72531934,58.32891397]}, 
          date: new moment().subtract('weeks', 1).format()
        },
        {
          id: 3, 
          title: 'Place C', 
          description: 'Lorem Ipsum bla bla bla', 
          type: 'New mine', 
          priority: 2, 
          geom: {"type":"Point","coordinates":[27.29506401,59.26591895]}, 
          date: new moment().format()
        },
        {
          id: 4, 
          title: 'Place D', 
          description: 'Lorem Ipsum bla bla bla', 
          type: 'Another mine', 
          priority: 1, 
          geom: {"type":"Point","coordinates":[25.63735671,58.3038225]}, 
          date: new moment().format()
        }
    ]
      
  collection.insert(data, {w:1}, function(err, result) {
    console.log(result)
  });

});