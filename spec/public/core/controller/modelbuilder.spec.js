var assert = require('assert');
var MockPixelCanvas = require('../graphics/mockpixelcanvas');
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

var ModelBuilder = requirejs('core/controller/modelbuilder');
var IdentityConverter = requirejs('core/model/converters/identityconverter');
var Encoder = requirejs('core/util/encoder');

// Helper function makes multiple edits to given modelBuilder
function makeEdits(modelBuilder) {
  modelBuilder.commitChange({
    action: 'set',
    elements: [
      { x: 0, y: 1, color: '#000000' },
      { x: 1, y: 0, color: '#000000' },
      { x: 1, y: 1, color: '#000000' }
    ]
  });
  modelBuilder.commitChange({
    action: 'fill',
    elements: [
      { x: 0, y: 0, color: '#FF0000' }
    ]
  });
  modelBuilder.commitChange({
    action: 'clear',
    elements: [
      { x: 1, y: 1, color: '#000000' }
    ]
  });
}


// Helper function asserts arrays of objects are equal using dimensions to
// guarantee ordering
//
// opt_orderMatters set to true ensures that arrays are equal and in same order
function assertObjectArraysEqual(oa1, oa2, dimensions, optOrderMatters) {
  if (oa1.length !== oa2.length) {
    throw new Error('Pixel arrays not equivalent lengths');
  }

  if (!optOrderMatters) {
    oa1 = _.sortBy(oa1, function (p) {
      return Encoder.coordToScalar(p, dimensions);
    });
    oa2 = _.sortBy(oa2, function (p) {
      return Encoder.coordToScalar(p, dimensions);
    });
  }

  var zipped = _.zip(oa1, oa2);

  _.each(zipped, function (pair) {
    if (!_.isEqual(pair[0], pair[1])) {
      throw new Error('Element arrays not equal:\n' + JSON.stringify(oa1) +
                      '\n' + JSON.stringify(oa2));
    }
  });
}


describe('ModelBuilder', function () {
  var dimensions;
  var mockCanvas;
  var modelBuilder;

  beforeEach(function () {
    dimensions = { width: 3, height: 3 };
    mockCanvas = new MockPixelCanvas(dimensions, '#FFFFFF');
    modelBuilder = new ModelBuilder(mockCanvas, { color: '#FFFFFF' },
                                    { color: '#000000'}, IdentityConverter);
  });


  it('should clear model on ModelBuilder#clear', function () {
    makeEdits(modelBuilder);
    modelBuilder.clear();

    assert(modelBuilder.elements.length === 0);
  });


  describe('ModelBuilder#commitChange', function () {
    context('when a current change is present', function () {
      it('should use current change when no arguments are provided',
        function () {
          var elements = [{ x: 0, y: 0, color: '#000000' }];

          modelBuilder.currentChange = {
            action: 'set',
            elements: elements
          };
          modelBuilder.commitChange();

          assertObjectArraysEqual(modelBuilder.elements, elements, dimensions);
        }
      );

      it('should use argument current change when provided',
        function () {
          var elements = [{ x: 0, y: 0, color: '#000000' }];

          modelBuilder.currentChange = {
            action: 'set',
            elements: [{ x: 1, y: 1, color: '#FFFFFF' }]
          };
          modelBuilder.commitChange({ action: 'set', elements: elements });

          assertObjectArraysEqual(modelBuilder.elements, elements, dimensions);
        }
      );
    });


    context('when applying different edits', function () {
      it('should add elements with "set"', function () {
        var elements = [{ x: 0, y: 0, color: '#000000' }];

        modelBuilder.commitChange({
          action: 'set',
          elements: elements
        });

        assertObjectArraysEqual(modelBuilder.elements, elements, dimensions);
      });

      it('should add elements with "fill"', function () {
        var elements = [{ x: 0, y: 0, color: '#000000' }];

        modelBuilder.commitChange({
          action: 'fill',
          elements: elements
        });

        assertObjectArraysEqual(modelBuilder.elements, elements, dimensions);
      });

      it('should remove elements with "clear"', function () {
        var elements = [{ x: 0, y: 0, color: '#000000' }];

        modelBuilder.commitChange({
          action: 'fill',
          elements: elements
        });


        modelBuilder.commitChange({
          action: 'clear',
          elements: elements
        });

        assert(modelBuilder.elements.length === 0);
      });

      it('should remove all elements with "clear all"', function () {
        makeEdits(modelBuilder);

        modelBuilder.commitChange({ action: 'clear all', elements: null });

        assert(modelBuilder.elements.length === 0);
      });

      it('should remove all elements and add new elements with "import"',
        function () {
          var elements = [{ x: 0, y: 0, color: '#123456' }];

          makeEdits(modelBuilder);

          modelBuilder.commitChange({
            action: 'import',
            elements: elements
          });

          assertObjectArraysEqual(modelBuilder.elements, elements, dimensions);
        }
      );
    });


    context('undo/redo stacks', function () {
      it('should add changes to undoStack', function () {
        makeEdits(modelBuilder);

        assert(modelBuilder.undoStack.length === 3);
      });
      
      it('should drop redo stack by default', function () {
        var elements = [{ x: 0, y: 0, color: '#123456' }];
        makeEdits(modelBuilder);

        modelBuilder.undo();

        modelBuilder.commitChange({
          action: 'import',
          elements: elements
        });

        assert(modelBuilder.redoStack.length === 0);
      });
      
      it('should keep redo stack with preserve set to true', function () {
        var elements = [{ x: 0, y: 0, color: '#123456' }];
        makeEdits(modelBuilder);

        modelBuilder.undo();

        modelBuilder.commitChange({
          action: 'import',
          elements: elements
        }, true);

        assert(modelBuilder.redoStack.length === 1);
      });
    });
  });

  describe('ModelBuilder#exportModel', function () {
    before(function () {
      sinon.spy(IdentityConverter, 'fromCommonModelFormat');
    });

    it('should run model through converter and convert to JSON', function () {
      makeEdits(modelBuilder);
      var exportedModelJSON = modelBuilder.exportModel();
      var exportedModel = JSON.parse(exportedModelJSON);

      assertObjectArraysEqual(exportedModel.elements, [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 0, color: '#FF0000' }
      ], dimensions);
      assert(_.isEqual(exportedModel.defaultElement,
                       modelBuilder.getDefaultElement()));
      assert(_.isEqual(exportedModel.currentElement,
                       modelBuilder.getCurrentElement()));
      assert(_.isEqual(exportedModel.dimensions, mockCanvas.getDimensions()));
      assert(IdentityConverter.fromCommonModelFormat.calledOnce);
    });

    after(function () {
      IdentityConverter.fromCommonModelFormat.restore();
    });
  });
});
