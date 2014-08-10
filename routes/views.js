var auth = require('../lib/auth.js');

exports.home = function (req, res) {
  var opts = {
    title: 'upstrea.me',
    main: 'scripts/core/main.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/homescreen.min.js';
  }

  res.render('home', opts);
};

exports.invaders = function (req, res) {
  var opts = {
    title: 'Invaders',
    main: 'scripts/invaders/main.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/invaders.min.js';
  }

  res.render('invaders', opts);
};

exports.pixeleditor = function (req, res) {
  var opts = {
    title: 'Pixel Editor',
    loggedIn: auth.isLoggedIn(req),
    main: 'scripts/pixeleditor/main.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/pixeleditor.min.js';
  }

  res.render('pixeleditor', opts);
};

exports.submersion = function (req, res) {
  var opts = {
    title: 'Submersion',
    main: 'scripts/submersion/main.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/submersion.min.js';
  }

  res.render('submersion', opts);
};
