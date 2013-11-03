exports.login = function (req, res) {
  res.send(200);
};

exports.logout = function (req, res) {
  req.logout();
  res.send(200);
};
