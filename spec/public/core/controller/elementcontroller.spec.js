var assert = require('assert');
var requirejs = require('requirejs');
var sinon = require('sinon');
var _ = require('underscore');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var ElementController = requirejs('core/controller/elementcontroller');

describe('ElementController', function () {
  var menu = {
    x: 0,
    y: 0,
    color: '#FFFFFF'
  };
  var mockConstructor;

  beforeEach(function () {
    mockConstructor = sinon.spy(function (params) {
      return params;
    });

    ElementController.clear();
    ElementController.register('test', 'testType', mockConstructor, menu);
    ElementController.register('test2', 'testType', mockConstructor, menu);
  });

  
  context('when the element has been registered with the controller',
    function () {
      it('should create the element from the model', function () {
        var element = ElementController.create('test', menu);

        assert(_.isEqual(menu, element));
        assert(mockConstructor.calledOnce);
        assert(mockConstructor.calledWith(menu));
      });

      it('should retrieve element name(s) by type', function () {
        assert(_.isEqual(['test', 'test2'],
                         ElementController.getByType('testType')));
      });

      it('should retrieve element menu by name', function () {
        assert(_.isEqual(menu, ElementController.getMenu('test')));
      });
    }
  );


  context('when element has not been registered with the controller',
    function () {
      it('should return null from ElementController.create', function () {
        assert(ElementController.create('doesntexist', menu) === null);
      });

      it('should return empty array from ElementController.getByType',
        function () {
          assert(ElementController.getByType('doesntexist').length === 0);
        }
      );

      it('should return null from ElementController.create', function () {
        assert(ElementController.getMenu('doesntexist') === undefined);
      });
    }
  );
});
