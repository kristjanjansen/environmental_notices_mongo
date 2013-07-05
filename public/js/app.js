var page = require('page')
var $ = require('jquery')
var gmap = require('gmap')
var hogan = require('hogan')

var moment = require('moment')

var defaultCenter = [25.1,58.58]
var defaultZoom = 7

var m = new gmap(document.getElementById('map'),{
  mapTypeId: 'hybrid', 
  centerCoords: defaultCenter, 
  zoom: defaultZoom,
  streetViewControl: false
})
m.init(router)

function router() {
  page('/*', config);
  page('/', function() {
    page('/week/' + moment().week())
  })
  page('/week/:week/:id?', data, map, list, pager, select);
  page({dispatch: true})
}


function config(ctx, next){
  $.getJSON('/config', function(config) {
    ctx.config = config
    next()
  })
}

// @TODO: to nav()

function pager(ctx, next) {
  var w = parseInt(ctx.params.week)

  $('#top').attr('href', '/week/' + w)

  $('#next').attr('href', '/week/' + (w + 1))
  $('#prev').attr('href', (w > 1) ? '/week/' + (w - 1) : '')
  
  var start = moment().week(w).startOf('week').add('days', 1).format('D. MMMM')
  var end = moment().week(w).startOf('week').add('days', 7).format('D. MMMM')
  $('#week').html(start + ' — ' + end)
  
  next()
}


function data(ctx, next) {
  var week = ctx.params.week
  $.getJSON('/api/week/' + week, function(data) {
    ctx.data = data
    next()
  })
}


function map(ctx, next) {
  m.addMarkers(ctx.data.markers)  
  m.on('marker.click', function(marker) {
    page('/week/' + ctx.params.week + '/' + ctx.data.markers[marker].id)
  })
  next()
}


function list(ctx, next) {
  
  var tmpl = '\
    {{#markers}}\
      <div id="{{id}}" {{#geom}}class="geom"{{/geom}}>\
      <div class="slug">\
        <h2>{{ type }}</h2>\
        <div class="description-short">\
        {{{description_short}}}\
        </div>\
      </div>\
      <div class="description">\
      {{{description}}}\
      <p><a href="{{url}}">Keskkonnateated</a></p>\
      </div>\
      </div>\
    {{/markers}}\
    {{^markers}}\
      <div class="error">No data for this week. Try other weeks</div>\
    {{/markers}}\
  '
  $('#list').html(hogan(tmpl, ctx.data))
  
  $('#list .slug').click(function(e){
    page('/week/' + ctx.params.week + '/' + $(this).parent().attr('id'))
    e.preventDefault()
  })
  
  next()
}


function select(ctx, next) {
 
  if (ctx.params.id) {
 
    var id = ctx.params.id
     
    $('#list #' + id).toggleClass('selected')
    $('#list').animate({
         scrollTop: $('#list').scrollTop() + $('#list #' + id).position().top - 119
     }, 100);
   
   
    var currentItem = {}
    
    ctx.data.markers.forEach(function(item) {
      if (item.id == id) currentItem = item 
    })      
    
    if (currentItem.geom !== null) {
      center = currentItem.geom.coordinates
      m.center(center)
      m.zoom(14)
    } else {
      m.zoom(defaultZoom)
    }

  } else {

    $('#list').animate({
         scrollTop: 0
     }, 0);    
    m.zoom(defaultZoom)
    m.center(defaultCenter)
  }

  next()  

}


function log(ctx, next) {
  console.log(ctx)
  next()
}

