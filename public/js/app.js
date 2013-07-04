var page = require('page')
var $ = require('jquery')
var gmap = require('gmap')

var moment = require('moment')
require('moment-isocalendar')

var m = new gmap(document.getElementById('map'),{
  mapTypeId: 'hybrid', 
  centerCoords: [58.58,25.1], 
  zoom: 6,
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


function pager(ctx, next) {
  var p = parseInt(ctx.params.week)
  $('#next').attr('href', '/week/' + (p + 1))
  $('#prev').attr('href', (p > 1) ? '/week/' + (p - 1) : '')
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
    page('/week/' + ctx.params.week + '/' + marker)
  })
  next()
}


function list(ctx, next) {
  
  // var tmpl = '<ul>{{#markers}}<li id="{{id}}">{{title}}</li>{{/markers}}</ul>'
  // $('#list').html(hogan(tmpl, ctx.data))
  
  var i = 0
  var contents = ''
  ctx.data.markers.forEach(function(item) {
    contents += '<li id="' + i + '">' + item.title + '</li>'
    i++
  })
  $('#list').html(contents)
  
  $('#list li').click(function(e){
    page('/week/' + ctx.params.week + '/' + $(this).attr('id'))
    e.preventDefault()
  })
  
  next()
}


function select(ctx, next) {
  if (ctx.params.id) {
    var id = ctx.params.id 
    $('#list #' + id).toggleClass('selected')
    center = ctx.data.markers[id].coords
    m.center(center)
  }
  next()  
}


function log(ctx, next) {
  console.log(ctx)
  next()
}

