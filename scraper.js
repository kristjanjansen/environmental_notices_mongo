var config = require('config');
var request = require('request');
var each = require('each')
var moment = require('moment')
var mongo = require('mongodb').MongoClient

var types = require('./lib/types')
var process = require('./lib/process')
  

// Build URL array

var start = (((config.pageStart || 1) - 1) * 10) + 1
var stop = (((config.pageCount || 1) - 1) * 10) + 11 + (start - 1)

var urls = []

for (var i = start; i < stop; i = i + 10) {
  urls.push('http://www.ametlikudteadaanded.ee/index.php?act=1&salguskpvavald=' + moment().subtract('M', 1).format('DD.MM.YYYY') + '&sloppkpvavald=' + moment().format('DD.MM.YYYY') + '&steateliigid=' + types.ids() + '&srange=' + i + '-' + (i + 9));
}

mongo.connect(config.mongoUrl, function(err, db) {
  
  if (err) { throw err }
  var collection = db.collection(config.mongoCollection);
  collection.remove(function() {});

  each(urls)
  .on('item', function(url, i, next) {
    request({url: url, encoding: 'binary'}, function (e, r, body) {
      process.processPage(collection, body, function() {
        setTimeout(next, 0)
      })
    })  
  })
  .on('end', function() {
    console.log('Scraper finished')
//  db.close()
  });

    
});