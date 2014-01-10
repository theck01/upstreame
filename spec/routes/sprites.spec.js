process.env.NODE_ENV = "test"; // supress server logging

var app = require("../../app");
var fs = require("fs");
var loginHelper = require("../helper/login");
var should = require("should");
var supertest = require("supertest");
var _ = require("underscore");

var request = supertest(app);
var agent = supertest.agent(app);

describe("sprite routes", function () {
  var filename = __dirname + "/../../public/assets/sprites/__test__.json";
  var sprite = {
    pixels: [{ x: 1, y: 2, color: "#000000" }],
    center: { x: 1, y: 2 },
    backgroundColor: "#FFFFFF",
    currentColor: "#FFFFFF",
    dimensions: { width: 3, height: 3 }
  };

  before(function (done) {
    loginHelper.fakeCredentials(done);
  });
  
  describe("GET /sprite/all", function () {
    
    before(function () {
      fs.writeFileSync(filename, JSON.stringify(sprite));
    });

    it("should return a list of all sprite names", function (done) {
        request.get("/sprite/all" )
               .end(function (err, res) {
                 _.isEqual(res.body.__test__, sprite).should.be.ok;
                 done();
               });
    });

    after(function () {
      fs.unlinkSync(filename, function () {});
    });
  });


  describe("GET /sprite/:name", function () {

    beforeEach(function () {
      fs.writeFileSync(filename, JSON.stringify(sprite));
    });
    
    context("when file with :name exists", function () {

      it("should retrieve the contents of the file", function (done) {
        request.get("/sprite/__test__" )
               .end(function (err, res) {
                 (_.isEqual(res.body, sprite)).should.be.true;
                 done();
               });
      });
    });

    context("when file with :name does not exist", function () {
      
      it("should retrieve the contents of the file", function (done) {
        request.get("/sprite/__nonexistant__" )
               .end(function (err, res) {
                 res.status.should.eql(404);
                 done();
               });
      });
    });

    afterEach(function () {
      fs.unlinkSync(filename, function () {});
    });
  });
  

  describe("POST /sprite/:name", function () {

    context("when user is not logged in", function () {
      it("should return 401, Unauthorized", function (done) {
        request.post("/sprite/__test__")
               .send(sprite)
               .expect(401, done);
      });
    });

    context("when user is logged in", function () {
      before(function (done) {
        loginHelper.login(agent, done);
      });

      context("when valid sprite is sent", function () {

        it("should write the sprite to the file", function (done) {
          var req = request.post("/sprite/__test__");
          agent.attachCookies(req);
          req.send(sprite)
             .end(function (err, res) {
               if (err) return done(err);
               res.status.should.eql(200);
               fs.readFile(filename, { encoding: "utf8" },
                 function (err, data) {
                   if (err) return done(err);
                   (_.isEqual(JSON.parse(data), sprite)).should.be.true;
                   done();
                 });
               });
        });

        after(function () {
          fs.unlinkSync(filename, function () {});
        });
      });

      context("when invalid sprite is sent", function () {
        var invalidSprite = { pixels: [] };

        it("should return 400", function (done) {
          var req = request.post("/sprite/__test__");
          agent.attachCookies(req);
          req.send(invalidSprite).expect(400, done);
        });
      });
    });
  });

  after(function (done) {
    loginHelper.restoreCredentials(done);
  });
});
