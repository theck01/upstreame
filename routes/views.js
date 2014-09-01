var auth = require('../lib/auth.js');

exports.blog = function (req, res) {
  var opts = {
    title: 'upstrea.me',
    main: 'scripts/blog/main.js'
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/blog.min.js';
  }

  res.render('blog', opts);
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
