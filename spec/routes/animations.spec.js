process.env.NODE_ENV = "test"; // supress server logging

var app = require("../../app");
var fs = require("fs");
var loginHelper = require("../helper/login");
var should = require("should");
var supertest = require("supertest");
var _ = require("underscore");

var request = supertest(app);
var agent = supertest.agent(app);

describe("animation routes", function () {
  var filename = __dirname + "/../../public/assets/animations/__test__.json";
  var animation = {
    backgroundColor: "#FFFFFF",
    dimensions: { width: 64, height: 64 },
    framesPerSprite: 5,
    spriteList: [ "test0.json", "test1.json" ]
  };

  before(function (done) {
    loginHelper.fakeCredentials(done);
  });

  describe("GET /animation/:name", function () {

    before(function () {
      fs.writeFileSync(filename, JSON.stringify(animation));
    });
    
    context("when file with :name exists", function () {

      it("should retrieve the contents of the file", function (done) {
        request.get("/animation/__test__" )
               .end(function (err, res) {
                 (_.isEqual(res.body, animation)).should.be.true;
                 done();
               });
      });
    });

    context("when file with :name does not exist", function () {
      
      it("should retrieve the contents of the file", function (done) {
        request.get("/animation/__nonexistant__" )
               .end(function (err, res) {
                 res.status.should.eql(404);
                 done();
               });
      });
    });

    after(function () {
      fs.unlinkSync(filename, function () {});
    });
  });
  

  describe("POST /animation/:name", function () {

    context("when user is not logged in", function () {
      it("should return 401, Unauthorized", function (done) {
        request.post("/animation/__test__")
               .send(animation)
               .expect(401, done);
      });
    });

    context("when user is logged in", function () {
      before(function (done) {
        loginHelper.login(agent, done);
      });

      context("when valid animation is sent", function () {

        it("should write the animation to the file", function (done) {
          var req = request.post("/animation/__test__");
          agent.attachCookies(req);
          req.send(animation)
             .end(function (err, res) {
               if (err) return done(err);
               res.status.should.eql(200);
               fs.readFile(filename, { encoding: "utf8" },
                 function (err, data) {
                   if (err) return done(err);
                   (_.isEqual(JSON.parse(data), animation)).should.be.true;
                   done();
                 });
               });
        });

        after(function () {
          fs.unlinkSync(filename, function () {});
        });
      });

      context("when invalid animation is sent", function () {
        var invalidAnimation = { pixels: [] };

        it("should return 400", function (done) {
          var req = request.post("/animation/__test__");
          agent.attachCookies(req);
          req.send(invalidAnimation).expect(400, done);
        });
      });
    });
  });

  after(function (done) {
    loginHelper.restoreCredentials(done);
  });
});
