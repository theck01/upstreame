exports.index = function (req, res) {
  res.render('home', {
    title: 'upstrea.me'
  });
};

exports.invaders = function (req, res) {
  res.render('invaders', {
    title: 'Invaders'
  });
};

exports.pixelart = function (req, res) {
  res.render('pixelart', {
    title: 'Pixel Art'
  });
};
