var assert = require('assert');
var requirejs = require('requirejs');
var should = require('should');
var _ = require('underscore');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var PriorityQueue = requirejs('util/priorityqueue');

describe('PriorityQueue', function () {
  var pq;

  beforeEach(function (done) {
    pq = new PriorityQueue(function (a, b) {
      if (a > b) {
        return true;
      }
      return false;
    });

    _.each([9,4,6,1,5,2], function (e) {
      pq.push(e);
    });

    done();
  });

  describe('PriorityQueue#remove', function () {
    it('should remove elements while preserving priority order',
      function (done) {
        pq.filter(function (e) {
          return e !== 5;
        });

        _.each([9,6,4,2,1], function (i) {
          pq.pop().should.eql(i);
        });

        done();
      }
    );
  });

  describe('PriorityQueue#peek', function () {
    context('when queue is not empty', function () {
      it('should return the highest priority element without removal',
        function (done) {
          pq.peek().should.eql(9);
          pq.peek().should.eql(9);
          done();
        }
      );
    });

    context('when queue is empty', function () {
      it('should return undefined', function (done) {
        for(var i=0; i<6; i++) pq.pop();
        assert.equal(pq.peek(), undefined);
        done();
      });
    });
  });

  describe('PriorityQueue#pop', function () {
    context('when queue is not empty', function () {
      it('should return elements in order of highest priority with removal',
        function (done) {
          _.each([9,6,5,4,2,1], function (e) {
            pq.pop().should.eql(e);
          });
          done();
        }
      );
    });


    context('when queue is empty', function () {
      it('should return undefined', function (done) {
        for(var i=0; i<6; i++) pq.pop();
        assert.equal(pq.pop(), undefined);
        done();
      });
    });
  });

  describe('PriorityQueue#push', function () {
    it('should add an element to the appropriate place in the queue',
      function (done) {
        pq.push(10);
        pq.peek().should.eql(10);
        pq.push(3);
        pq.peek().should.eql(10);
        done();
      }
    );
  });
});
