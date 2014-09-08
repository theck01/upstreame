process.env.NODE_ENV = "test"; // supress server logging

var app = require("../../app");
var fs = require("fs");
var should = require("should");
var supertest = require("supertest");
var _ = require("underscore");

var request = supertest(app);
var agent = supertest.agent(app);

describe("sprite routes", function () {
  var filename = __dirname + "/../../public/assets/sprites/__test__.json";
  var sprite = {
    pixels: [{ x: 1, y: 2, color: "#000000" }],
    backgroundColor: "#FFFFFF",
    currentColor: "#FFFFFF",
    dimensions: { width: 3, height: 3 }
  };
  
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
});
