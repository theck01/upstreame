exports.index = function (req, res) {
  res.render('game', {
    title: 'ScriptInvaders'
  });
};

exports.pixelart = function (req, res) {
  res.render('pixelart', {
    title: 'PixelArt'
  });
};
