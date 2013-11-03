var fs = require('fs');
var path = require('path');

exports.authenticate = function (username, password, done) {
	var usersFile = path.join(__dirname, '..', 'users.json');
	fs.readFile(usersFile, { encoding: 'utf8' }, function (err, data) {
		if (err) return done(err);

		var users = JSON.parse(data);
		if (!users[username]) {
			return done(null, false, { msg: 'Username not found' });
		}
		if (users[username] !== password) {
			return done(null, false,	{ msg: 'Password does not match' });
		}

		return done(null, { username: username });
	});
};


function isLoggedIn (req) {
  if(!req.isAuthenticated || !req.isAuthenticated()) return false;
  return true;
}


exports.ensureLoggedIn = function (req, res, next) {
  if (!isLoggedIn(req)) res.send(401);
  else next();
};


exports.isLoggedIn = isLoggedIn;
