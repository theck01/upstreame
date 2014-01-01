var animations = require('./routes/animations');
var auth = require('./lib/auth');
var express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var sessions = require('./routes/sessions');
var sprites = require('./routes/sprites');
var views = require('./routes/views');

if (!process.env.SESSION_SECRET) {
  console.log('Environment variable SESSION_SECRET must be set');
  process.exit(1);
}

var app = express();
module.exports = app;


// MIDDLEWARE CONFIGURATION

passport.use(new LocalStrategy(auth.authenticate));
passport.serializeUser(function (user, done) {
	done(null, JSON.stringify(user));
});
passport.deserializeUser(function (user, done) {
	done(null, JSON.parse(user));
});


// APP CONFIGURATION

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  if(process.env.NODE_ENV !== 'test') app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: process.env.SESSION_SECRET
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/bower_components'));
});


// ROUTES

// view routes
app.get('/', views.index);
app.get('/animator', views.animator);
app.get('/invaders', views.invaders);
app.get('/pixelart', views.pixelart);
app.get('/submersion', views.submersion);

// animation routes
app.get('/animation/:name', animations.load);
app.post('/animation/:name', auth.ensureLoggedIn, animations.save);

// authentication routes
app.post('/login', passport.authenticate('local'), sessions.login);
app.post('/logout', auth.ensureLoggedIn, sessions.logout);

// sprite routes
app.get('/sprite/all', sprites.all);
app.get('/sprite/:name', sprites.load);
app.post('/sprite/:name', auth.ensureLoggedIn, sprites.save);


app.listen(3000);
