exports.login = function (req, res) {
  res.status(200).end();
};

exports.logout = function (req, res) {
  req.logout();
  res.status(200).end();
};
