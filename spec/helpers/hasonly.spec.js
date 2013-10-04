var hasOnly = require("../../helpers/hasonly");
var should = require("should");

describe("hasAll helper", function () {

  context("when object has exact properties", function () {
    it("should return true", function () {
      hasOnly({one: 1, two: "two", three: function () {} },
              ["one", "two", "three"]).should.be.true;
    });
  });

  context("when object has fewer properties", function () {
    it("should return false", function () {
      hasOnly({one: 1, two: "two", three: function () {} },
              ["one", "two", "three", "four"]).should.be.false;
    });
  });

  context("when object has more properties", function () {
    it("should return false", function () {
      hasOnly({one: 1, two: "two", three: function () {}, four: [] },
              ["one", "two", "three"]).should.be.false;
    });
  });
});
