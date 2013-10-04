process.env.NODE_ENV = "test"; // supress server logging

var app = require("../../app");
var fs = require("fs");
var request = require("supertest");
var should = require("should");
var _ = require("underscore");

describe("sprite routes", function () {
  var filename = __dirname + "/../../public/assets/sprites/__test__.json";
  var sprite = { pixels: [{ x: 1, y: 2, color: "#000000" }],
                 center: { x: 1, y: 2 } };
  
  describe("GET /sprite/:name", function () {
    
    before(function () {
      fs.writeFileSync(filename, "dummy file");
    });

    it("should return a list of all sprite names", function (done) {
        request(app).get("/sprite/all" )
                    .end(function (err, res) {
                      _.find(res.body, function (name) {
                        return name === "__test__";
                      }).should.eql("__test__");
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
        request(app).get("/sprite/__test__" )
                    .end(function (err, res) {
                      (_.isEqual(res.body, sprite)).should.be.true;
                      done();
                    });
      });
    });

    context("when file with :name does not exist", function () {
      
      it("should retrieve the contents of the file", function (done) {
        request(app).get("/sprite/__nonexistant__" )
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

    context("when valid sprite is sent", function () {

      it("should write the sprite to the file", function (done) {
        request(app).post("/sprite/__test__")
                    .send(sprite)
                    .end(function () {
                      fs.readFile(filename, { encoding: "utf8" },
                        function (err, data) {
                          (_.isEqual(JSON.parse(data), sprite)).should.be.true;
                          done();
                      });
                    });
      });

      afterEach(function () {
        fs.unlinkSync(filename, function () {});
      });
    });

    context("when invalid sprite is sent", function () {
      var invalidSprite = { pixels: [] };

      it("should return 400", function (done) {
        request(app).post("/sprite/__test__")
                    .send(invalidSprite)
                    .end(function (err, res) {
                      res.status.should.eql(400);
                      done();
                    });
      });
    });
  });
});
