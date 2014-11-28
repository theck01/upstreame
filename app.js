var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var PostArchive = require('./lib/postarchive');
var posts = require('./routes/posts');
var sprites = require('./routes/sprites');
var views = require('./routes/views');


var app = express();
module.exports = app;


// APP CONFIGURATION
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else if(process.env.NODE_ENV === 'production') app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));


// BLOG POST INITIALIZATION
var archive = new PostArchive(__dirname + '/public/posts/');
var postRoutes = posts(archive);


// ROUTES

// post routes
app.get('/', postRoutes.lastPost);
app.get('/posts', postRoutes.all);
app.get('/posts/:title', postRoutes.getPost);
app.get('/posts/author/:author', postRoutes.getPostsByAuthor);
app.get('/posts/category/:category', postRoutes.getPostsByCategory);

// game and tool view routes
app.get('/invaders', views.invaders);
app.get('/pixeleditor', views.pixeleditor);
app.get('/submersion', views.submersion);

// sprite routes
app.get('/sprite/all', sprites.all);
app.get('/sprite/:name', sprites.load);


console.log('Listening on port 3000...');
app.listen(3000);
