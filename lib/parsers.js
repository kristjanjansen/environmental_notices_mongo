var $ = require('cheerio')
var request = require('request');
var each = require('each');
var p4js = require("proj4js")
require('proj4js-defs')(p4js)

// row.descriptionription = row.descriptionription.replace(/((ht|f)tp:\/\/w{0,3}[a-zA-Z0-9_\?\&\=\-.:#/~}]+)/gi, '<a target="_blank" href="$1">$1</a>')
// Mining L.MK/322586 

exports.short = function(item, callback) {
  if (item.type !== 'Maa riigi omandisse jätmise teated') {
  
 var max = 250
  item.description_short = item.description.split('\n')[0]
 if (item.description_short.length > max) {
   var el = item.description_short.substr(0, max).split(' ')
   el.pop()
   item.description_short = el.join(' ') + '...'
 }
 } else {
   item.description_short = ''
 }
 return callback(item)    

}

exports.kmh = function(item, callback) {
 if (item.type == 'Keskkonnamõju hindamise teated') {
   var matches = item.description.match(/algatamata/g)
   if (matches) {
    item.type = 'Keskkonnamõju hindamise algatamata jätmine'
    item.priority = 8
   }
 } 
 return callback(item)    
}

exports.br = function(item, callback) {
 
 item.description = item.description.replace(/\n+/g,'\n')    
 item.description = item.description.replace(/\n/g,'<br /><br />')    
 return callback(item)    

}

exports.biz = function(item, callback) {
  
  var regexp = /(\d{8})/g
  
  var matches = item.description.match(regexp)
  if (matches) {
    item.description = item.description.replace(regexp,'<a target="_blank" href="https://ariregister.rik.ee/ettevotja.py?ark=$1">$1</a>')    
    return callback(item)    
  } else {
    return callback(item)    
  }
}


exports.sadr = function(item, callback) {
  
  var regexp = /http:\/\/www\.keskkonnaamet\.ee\/sadr\/\?id=(\d{4,})\&?/g
  
  var matches = item.description.match(regexp)

  if (matches) {
    var id = matches[0].split('=')[1]
    if (id.substr(id.length - 1) == '&') {
      id = id.substr(0, id.length - 1)
    }
    item.id = id
    var site_url = 'http://www.keskkonnaamet.ee/sadr'
    var url = site_url + '/index.php?id=' + item.id
  
    request.get(url,
      function (error, response, body) {
        if (error) {
          console.log(error)
          throw error
        }        
        if (!error && response.statusCode == 200) {
          var body = $.load(body)
          item.url_sadr = site_url + '/' + body('#ADR_search_result_data tr').first().find('td').first().attr('onclick').split("'")[1]           
          item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_sadr + '">'+site_url+'</a>')
          return callback(item)
        }
    })
  
  } else {
    return callback(item)    
  }
}


exports.cad = function(item, callback, force) {
  if (item.type !== 'Maa riigi omandisse jätmise teated' || force) {
  
  var regexp = /(\d+:\d+:\d+)/g
  
  var matches = item.description.match(regexp)
  if (matches) {
    item.cad = matches[0] 
    cad2geo(item.cad, function(geo) {
       if (geo) {
        var url = 'http://xgis.maaamet.ee/ky/FindKYByT.asp?txtCU='
        item.lat = geo.y
        item.lng = geo.x
        item.the_geom = {'type': 'Point', 'coordinates': [geo.x, geo.y]}
        item.url_cad = url + item.cad
        item.description = item.description.replace(regexp,'<a target="_blank" href="'+ url + '$1">$1</a>')
       }
       return callback(item)
   })
 } else {
   return callback(item)    
 }
 } else {
   return callback(item)       
 }
}


exports.cad2 = function(item, callback) {
 item.childs = []
 if (item.type == 'Maa riigi omandisse jätmise teated') {
   var d = item.description.replace(/<br.+>/gi,'\n')
   var regexp = /\b[1-2]?[0-9]\.\s(.+)\n/gi
   var matches = d.match(regexp)
   if (matches) {
     childs = []
     each(matches)
       .on('item', function(match, i, next) {
         var child = {}
         child.id = item.id.substr(0, item.id.length - 1) + (i + 1)
         child.priority = item.priority
         child.date = item.date
         child.type = item.type
         child.description = match.replace(/\t/g,' ').replace(/\b[1-2]?[0-9]\.\s/,'').substr(0, match.length - 1)
         child.description_short = item.description_short
         exports.cad(child, function(child) {
           if (child.the_geom) item.childs.push(child)
           setTimeout(next, 0)
         }, true)
       })
       .on('end', function() {
          return callback(item) 
       })
 } else {
 return callback(item) 
}
} else {
  return callback(item)   
  }
}


exports.permit_waste = function(item, callback) {
 
 // TODO: L.JÄ.LV-200276 has different layout
  
  var regexp = /L\.JÄ(\/|.LV-)\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
       
       url = 'http://klis2.envir.ee/' + body('.relation_heading_row').eq(2).parent().find('.list_data a').eq(0).attr('href')
           
       request.get(url, function (error, response, body) {
         if (error) {
           console.log(error)
           throw error
         }
         
         var body = $.load(body);
         
         point = body('#global_table_layer td').eq(2).find('td').text().match(/(\d+)/g)
         if (point) {
         var geo = lest2geo([point[1],point[0]], 'perm_waste')

         item.lat = geo.y
         item.lng = geo.x
         item.the_geom = {'type': 'Point', 'coordinates': [geo.x, geo.y]}

         item.geoname = body('#global_table_layer td').eq(0).find('td').text()
         item.cad = body('#global_table_layer td').eq(3).find('td').text()
         
         item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a> (' + item.geoname + ' ' + item.cad + ')')
         
         }
         return callback(item)
       
       })                      
      } else {

        return callback(item)
        
      }
      
     })
 
  } else {
   return callback(item)    
 }
}





exports.permit_complex = function(item, callback) {
  
  var regexp = /KKL\/\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {
  
      if (page) {
       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url
       
       var x = body('#exp_col_layer_3048 tr:nth-child(9) td').text()
       var y = body('#exp_col_layer_3048 tr:nth-child(8) td').text()
       if (x && y) {
         var geo = lest2geo([x,y], 'permit_complex')       
         item.lat = geo.y
         item.lng = geo.x
         item.the_geom = {'type': 'Point', 'coordinates': [geo.x, geo.y]}
       }
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
      }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}



exports.permit_air = function(item, callback) {
  
  var regexp = /L\.ÕV(\/|\.VÕ\-|\.HA\-)\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    
       var permit = {}

       item.url_permit = page.url

       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
       
       var x = body('#exp_col_layer_1566 tr:nth-child(4) td').text()
       var y = body('#exp_col_layer_1566 tr:nth-child(3) td').text()
       if (x && y) {
         var geo = lest2geo([x,y], 'permit_air')
         if (geo) {
           item.lat = geo.y
           item.lng = geo.x
           item.the_geom = {'type': 'Point', 'coordinates': [geo.x, geo.y]}
         }
      }
     }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}


exports.permit_water = function(item, callback) {
  
  // TODO Different coordinates L.VV/300213 
  //L.VV.LÄ-166343 
  //L.VV.HA-183003
  var matches = item.description.match(/(põhjave|puurkaev|vee võtm)/g)
  if (matches) {
    item.priority = 0
  }
  
  var regexp = /L\.(VV\/|LÄ\-|VV\.HA\-)\d{6,}/g
  
  var matches = item.description.match(regexp)
  if (matches) {

    item.id_permit = matches[0] 
    
    get_permit_page(item.id_permit, function(page) {

      if (page) {

       var body = $.load(page.body)    

       item.url_permit = page.url       
       
       item.description = item.description.replace(regexp,'<a target="_blank" href="' + item.url_permit + '">' + item.id_permit + '</a>')
      }
       return callback(item)

     })
 
  } else {
   return callback(item)    
 }
}





function get_permit_page(id_permit, callback) {

var permit_site_url = 'http://klis2.envir.ee' 
  
request.post(
    permit_site_url,
    { 
      form: { 
        search: 'Otsi',
        field_674766_search_type: 'CO',
        field_1063_search_type: 'CO',
        field_1063_search_value: id_permit,
        field_70599_search_type: 'CO',
        field_1066_search_type: 'CO',
        field_1077_search_type: 'CO',
        page: 'klis_pub_list_dynobj',
        tid: '1031'
      } 
    },
    function (error, response, body) {
      if (error) {
        console.log(error)
        throw error
      }
      
        if (!error && response.statusCode == 200) {
            var body = $.load(body)
            var link = body('.list_data td:first-child a')
            var permit_type = link.text()
            var url = permit_site_url + link.attr('href')
            
            if (permit_type) {   
              request.get(url, function (error, response, body) {
                if (error) {
                  console.log(error)
                  throw error
                }                
                return callback({url: url, body:body})                                
              })
            } else {
              return callback()
            }
        }
      })
}






function cad2geo(cad, callback) {

  var url = 'http://geoportaal.maaamet.ee/url/xgis-ky.php?ky=' + cad + '&what=tsentroid&out=json'
  var lest = []

  request({url:url, json:true}, function (error, response, body) {
    if (error) {
      console.log(error)
      throw error
    }
    if (body) {
      var geo = lest2geo([body[1].X, body[1].Y])
      if (geo) {
        return callback(geo)
      }
    } 
    return callback()
  });

}

function lest2geo(lest, from) {
  var p4js = require("proj4js")
  require('proj4js-defs')(p4js)

  // @TODO convert to async https://github.com/temsa/node-proj4js#asychonous-mode
 
  src = new p4js.Proj("EPSG:3301")
  dst = new p4js.Proj("EPSG:4326")
  
  var ret = {}
  if (lest[0] && lest[1]) {
    geo = p4js.transform(src, dst, new p4js.Point(lest))
    return geo
  }
}

function compare(a,b) {
  if (a.id < b.id)
     return -1;
  if (a.id > b.id)
    return 1;
  return 0;
}

