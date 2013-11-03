var app = require('../../app');
var fs = require('fs');
var path = require('path');
var supertest = require('supertest');


// fakeCredentials saves actual credentials to users.json.original, an uses
// a new credential file containing one user (username: "username", password:
// "password")
//
// Arguments:
//   done: function that takes an optional error argument, called when faking
//         completes
exports.fakeCredentials = function (done) {
  var usersFile = path.join(__dirname, '..', '..', 'users.json');
  var originalUsersFile = usersFile + '.original';

  if (fs.existsSync(usersFile)) {
    fs.renameSync(usersFile, originalUsersFile);
  }

  fs.writeFile(usersFile, JSON.stringify({ 'username':'password' }),
               function (err) {
                 if (err) return done(err);
                 return done();
               });
};


// login saves cookie information to the given agent after a successful login
// request, allowing authenticated routes to be used with the cookie stored
// in the agent
//
// Arguments:
//   agent: agent to attach authenticated cookie onto
//   done: function that takes an optional error argument, called when login
//         completes
exports.login = function (agent, done) {
      supertest(app).post('/login' )
                    .send({ 'username': 'username', 'password': 'password' })
                    .end(function (err, res) {
                      if (err) return done(err);
                      agent.saveCookies(res);
                      done();
                    });
};


// restoreCredentials removes the test credential file and replaces the original
// users.json file (if any existed)
//
// Arguments:
//   done: function that takes an optional error argument, called when
//         restoration completes
exports.restoreCredentials = function (done) {
  var usersFile = path.join(__dirname, '..', '..', 'users.json');
  var originalUsersFile = usersFile + '.original';

  fs.unlinkSync(usersFile);
  if (fs.existsSync(originalUsersFile)) {
    fs.renameSync(originalUsersFile, usersFile);
  }

  return done();
};
