process.env.NODE_ENV = 'test'; // supress server logging

var app = require('../../app');
var fs = require('fs');
var loginHelper = require('../helper/login');
var path = require('path');
var should = require('should');
var supertest = require('supertest');

var request = supertest(app);
var agent = supertest.agent(app);

describe('User sessions', function () {
  before(function (done) {
    loginHelper.fakeCredentials(done);
  });


  describe('POST /login', function () {
    context('when valid username and password are given', function () {
      it('should return 200, Success', function (done) {
        request.post('/login' )
               .send({ 'username': 'username', 'password': 'password' })
               .expect(200, done);
      });
    });

    context('when invalid username is given', function () {
      it('should return 401, Unauthorized', function (done) {
        request.post('/login' )
               .send({ 'username': 'test', 'password': 'password' })
               .expect(401, done);
      });
    });

    context('when invalid password is given', function () {
      it('should return 401, Unauthorized', function (done) {
        request.post('/login' )
               .send({ 'username': 'username', 'password': 'test' })
               .expect(401, done);
      });
    });
  });


  describe('POST /logout', function () {
    before(function (done) {
      loginHelper.login(agent, done);
    });

    context('when logged in', function () {
      it('should return 200, Success', function (done) {
         var req = request.post('/logout');
         agent.attachCookies(req);
         req.expect(200, done);
      });
    });

    context('when not logged in', function () {
      it('should return 401, Unauthorized', function (done) {
         request.post('/logout').expect(401, done);
      });
    });
  });


  after(function (done) {
    loginHelper.restoreCredentials(done);
  });
});
