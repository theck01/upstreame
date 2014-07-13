var auth = require('../lib/auth.js');

exports.animator = function (req, res) {
  var opts = {
    title: 'Animator',
    loggedIn: auth.isLoggedIn(req),
    main: 'scripts/core/animator.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/animator.min.js';
  }

  res.render('animator', opts);
};

exports.index = function (req, res) {
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

exports.pixelart = function (req, res) {
  var opts = {
    title: 'Pixel Art',
    loggedIn: auth.isLoggedIn(req),
    main: 'scripts/core/pixelart.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/pixelart.min.js';
  }

  res.render('pixelart', opts);
};

exports.pixeleditor = function (req, res) {
  var opts = {
    title: 'Pixel Editor',
    loggedIn: auth.isLoggedIn(req),
    main: 'scripts/pixeleditor/main.js'
  };

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

exports.worldbuilder = function (req, res) {
  var opts = {
    title: 'World Builder',
    loggedIn: auth.isLoggedIn(req),
    main: 'scripts/core/worldbuilder.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/worldbuilder.min.js';
  }

  res.render('worldbuilder', opts);
};
