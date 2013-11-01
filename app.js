var express = require('express');
var views = require('./routes/views');
var sprites = require('./routes/sprites');

var app = express();
module.exports = app;

// CONFIGURATION
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// MIDDLEWARE
if(process.env.NODE_ENV !== 'test') app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.json());

// ROUTES

// view routes
app.get('/', views.index);
app.get('/invaders', views.invaders);
app.get('/pixelart', views.pixelart);

// sprite routes
app.get('/sprite/all', sprites.all);
app.get('/sprite/:name', sprites.load);
app.post('/sprite/:name', sprites.save);


app.listen(3000);
