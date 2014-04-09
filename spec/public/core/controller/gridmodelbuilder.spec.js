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

var EventHub = requirejs('core/controller/eventhub');
var GridModelBuilder = requirejs('core/controller/gridmodelbuilder');
var GridModel = requirejs('core/model/gridmodel');
var IdentityConverter = requirejs('core/model/converters/identityconverter');
var Encoder = requirejs('core/util/encoder');

// Helper function makes multiple edits to given modelBuilder
function makeEdits(modelBuilder) {
  modelBuilder.commitChanges([
    {
      action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
      elements: [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 1, y: 1, color: '#000000' }
      ]
    },
    {
      action: GridModelBuilder.CONTROLLER_ACTIONS.FILL,
      elements: [
        { x: 0, y: 0, color: '#FF0000' }
      ]
    },
    {
      action: GridModelBuilder.CONTROLLER_ACTIONS.CLEAR,
      elements: [
        { x: 1, y: 1, color: '#000000' }
      ]
    }
  ]);
}


function elementArraysEqual(ary1, ary2) {
  return _.reduce(ary1, function (memo, e1) {
    return memo && _.find(ary2, function (e2) {
      return _.isEqual(e1, e2);
    });
  }, true);
}


describe('GridModelBuilder', function () {
  var dimensions;
  var mockCanvas;
  var gridModel;
  var modelBuilder;

  beforeEach(function () {
    dimensions = { width: 3, height: 3 };
    mockCanvas = new MockPixelCanvas(dimensions, '#FFFFFF');
    gridModel = new GridModel();
    modelBuilder = new GridModelBuilder(gridModel, mockCanvas,
                                        { color: '#FFFFFF' },
                                        { color: '#000000'}, IdentityConverter);
  });


  it('should clear model on GridModelBuilder#clear', function () {
    makeEdits(modelBuilder);
    modelBuilder.clear();

    assert(modelBuilder.getModelElements().length === 0);
  });


  describe('commitChanges', function () {
    context('when a current change is present', function () {
      it('should use current change when no arguments are provided',
        function () {
          var applyChangesSpy = sinon.spy(gridModel, 'applyChanges');
          var elements = [{ x: 0, y: 0, color: '#000000' }];

          var expectedChange = {
            action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
            elements: elements
          };

          EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
          modelBuilder.commitChanges();

          assert(applyChangesSpy.calledOnce);
          assert(applyChangesSpy.calledWith([expectedChange]));
        }
      );

      it('should use argument current change when provided',
        function () {
          var applyChangesSpy = sinon.spy(gridModel, 'applyChanges');
          var elements = [{ x: 0, y: 0, color: '#000000' }];

          modelBuilder.currentChange = {
            action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
            elements: [{ x: 1, y: 1, color: '#FFFFFF' }]
          };
          var expectedChange = {
            action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
            elements: elements
          };
          modelBuilder.commitChanges([expectedChange]);

          assert(applyChangesSpy.calledOnce);
          assert(applyChangesSpy.calledWith([expectedChange]));
        }
      );
    });


    context('when applying different edits', function () {
      it('should add elements with "set"', function () {
        var applyChangesSpy = sinon.spy(gridModel, 'applyChanges');
        var elements = [{ x: 0, y: 0, color: '#000000' }];

        modelBuilder.commitChanges([{
          action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
          elements: elements
        }]);

        assert(elementArraysEqual(modelBuilder.getModelElements(), elements));

        var expectedChange = {
          action: GridModel.MODEL_ACTIONS.SET,
          elements: elements
        };
        assert(applyChangesSpy.calledOnce);
        assert(applyChangesSpy.calledWith([expectedChange]));
      });

      it('should remove elements with "clear"', function () {
        var elements = [{ x: 0, y: 0, color: '#000000' }];

        modelBuilder.commitChanges([{
          action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
          elements: elements
        }]);

        var applyChangesSpy = sinon.spy(gridModel, 'applyChanges');

        modelBuilder.commitChanges([{
          action: GridModelBuilder.CONTROLLER_ACTIONS.CLEAR,
          elements: elements
        }]);

        assert(modelBuilder.getModelElements().length === 0);

        var expectedChange = {
          action: GridModel.MODEL_ACTIONS.CLEAR,
          elements: elements
        };
        assert(applyChangesSpy.calledOnce);
        assert(applyChangesSpy.calledWith([expectedChange]));
      });
    });


    context('when redos are present', function () {

    });
  });


  describe('exportModel', function () {
    before(function () {
      sinon.spy(IdentityConverter, 'fromCommonModelFormat');
    });

    it('should run model through converter and convert to JSON', function () {
      makeEdits(modelBuilder);
      var exportedModelJSON = modelBuilder.exportModel();
      var exportedModel = JSON.parse(exportedModelJSON);

      assert(elementArraysEqual(exportedModel.elements, [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 0, color: '#FF0000' }
      ]));
      assert(_.isEqual(exportedModel.defaultElement,
                       modelBuilder.getDefaultElement()));
      assert(_.isEqual(exportedModel.currentElement,
                       modelBuilder.getCurrentElement()));
      assert(_.isEqual(exportedModel.dimensions, modelBuilder.getDimensions()));
      assert(IdentityConverter.fromCommonModelFormat.calledOnce);
    });

    after(function () {
      IdentityConverter.fromCommonModelFormat.restore();
    });
  });


  it('should retrieve the active element on getCurrentElement', function () {
    assert(_.isEqual(modelBuilder.getCurrentElement(), { color: '#000000' }));
  });


  it('should retrieve the active element on getDefaultElement', function () {
    assert(_.isEqual(modelBuilder.getDefaultElement(), { color: '#FFFFFF' }));
  });


  it('should retrieve elements within builder frame relative to the frame on ' +
    'getModelElements', function () {
      makeEdits(modelBuilder);

      var elements = [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 0, color: '#FF0000' }
      ];
      assert(elementArraysEqual(modelBuilder.getModelElements, elements));
      
      modelBuilder.move({ x: -1, y: -1 });
      modelBuilder.resize({ width: 2, height: 2 });

      elements = [
        { x: 1, y: 1, color: '#FF0000' }
      ];
      assert(elementArraysEqual(modelBuilder.getModelElements, elements));
    }
  );


  it('should import a model encoded as a JSON string on importModel',
    function () {
      var modelObj = {
        defaultElement: { color: '#777777' },
        currentElement: { color: '#AAAAAA' },
        dimensions: { width: 10, height: 10 },
        elements: [
          { x: 0, y: 0, color: '#FFFFFF' },
          { x: 5, y: 5, color: '#00FF00' },
          { x: 9, y: 9, color: '#0000FF' }
        ]
      };

      modelBuilder.importModel(JSON.stringify(modelObj));
      assert(_.isEqual(modelBuilder.getCurrentElement(),
                       modelObj.currentElement));
      assert(_.isEqual(modelBuilder.getDefaultElement(),
                       modelObj.defaultElement));
      assert(_.isEqual(modelBuilder.getDimensions(), modelObj.dimensions));
      assert(elementArraysEqual(modelBuilder.getModelElements(),
                                modelObj.elements));
    }
  );


  it('should set callback to be called on mouse move actions on mousemove',
    function () {
      var canvasActionSpy = sinon.spy();
      modelBuilder.afterCanvasAction(canvasActionSpy);
      EventHub.trigger('canvas.action', { positions: [] });

      assert(canvasActionSpy.calledOnce);
    }
  );


  describe('paint', function () {
    it('should paint all elements within builder frame to the canvas',
      function () {

      }
    );
  });
});
