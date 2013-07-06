var $ = require('cheerio')
var each = require('each')
var moment = require('moment')

var types = require('../lib/types')
var parsers = require('../lib/parsers')

exports.processPage = function(collection, body, callback) {

  var rows = []
 
  var body = $.load(body)
  var body_rows = []

  each(body('table[cellpadding=3] tr').toArray())
    .on('item', function(body_row, i, next_row) {
      if (i % 3 == 0) {
        
        var row = {}
        var link = $(body_row).find('td.right a').attr('href')
        if (link) {
          link = link.split('=')
        row.id = link[link.length - 1] + '-0'
        row.date = moment($(body_row).find('td[width=85]').text().trim(), 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
        row.type = $(body_row).find('td.teateliik').text().trim();
        row.description = $(body_row).next().find('td[colspan=4]').text().trim().replace("'", "''");
        
        row.priority = types.types.filter(function(item) {
            return item.name === row.type
        })[0].priority
          
        _processRow(row, function(p_row) {
  
          if (p_row.childs.length < 2) {
             p_row.childs.push(p_row)
         }

            each(p_row.childs)
              .on('item', function(p_row, i, next) {
                var data = {
                  geom: p_row.the_geom ? p_row.the_geom : null,
                  id: p_row.id,
                  priority: p_row.priority,
                  date: p_row.date,
                  type: p_row.type,
                  description: p_row.description,
                  description: p_row.description,
                  description_short: p_row.description_short,
                  url: 'http://www.ametlikudteadaanded.ee/index.php?act=1&teade=' + p_row.id.split('-')[0]
                }
                collection.insert(data, {w:1}, function(err, result) {
                  // console.log(result)
                  setTimeout(next, 0)
                })
              })
        })
              
      }
    }
      setTimeout(next_row, 0)
      
    })
    .on('end', function() {
      
      return callback()
    
    })


}


function _processRow(row, callback) {
  
    var parser_ids = [
      'short',
      'kmh',
      'sadr',
      'biz',
      'permit_waste',
      'permit_complex',
      'permit_air',
      'permit_water',
      'cad2',
      'cad',
      'br'    
    ]

    each(parser_ids)
      .on('item', function(parser_id, i, next) {
        parsers[parser_id](row, function(row) {
          row = row
          setTimeout(next, 0)
        })
      })
      .on('end', function() {
        return callback(row)    
      })
  
}