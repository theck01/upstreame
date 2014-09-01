var animations = require('./routes/animations');
var auth = require('./lib/auth'); var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var passport = require('passport');
var sessionMiddleware = require('express-session');
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
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else if(process.env.NODE_ENV === 'production') app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(sessionMiddleware({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));


// ROUTES

// view routes
app.get('/', views.home);
app.get('/invaders', views.invaders);
app.get('/pixeleditor', views.pixeleditor);
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
