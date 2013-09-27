var express = require('express');
var app = express();
var views = require('./routes/views');

// configure express
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// setup middleware
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// routes
app.get('/', views.index);
app.get('/pixelart', views.pixelart);

app.listen(3000);
