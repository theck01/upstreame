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
  modelBuilder.commitChanges([{
    action: GridModel.MODEL_ACTIONS.SET,
    elements: [
      { x: 0, y: 1, color: '#000000' },
      { x: 1, y: 0, color: '#000000' },
      { x: 1, y: 1, color: '#000000' }
    ]
  }]);
  modelBuilder.commitChanges([{
    action: GridModel.MODEL_ACTIONS.SET,
    elements: [
      { x: 0, y: 0, color: '#FF0000' }
    ]
  }]);
  modelBuilder.commitChanges([{
    action: GridModel.MODEL_ACTIONS.CLEAR,
    elements: [
      { x: 1, y: 1, color: '#000000' }
    ]
  }]);
}


function assertElementArraysEqual(ea1, ea2, dimensions, opt_orderMatters) {
  if (ea1.length !== ea2.length) {
    throw new Error('Pixel arrays not equivalent lengths');
  }

  if (!opt_orderMatters) {
    ea1 = _.sortBy(ea1, function (p) {
      return Encoder.coordToScalar(p, dimensions);
    });
    ea2 = _.sortBy(ea2, function (p) {
      return Encoder.coordToScalar(p, dimensions);
    });
  }

  var zipped = _.zip(ea1, ea2);

  _.each(zipped, function (pair) {
    if (!_.isEqual(pair[0], pair[1])) {
      throw new Error('Element arrays not equal:\n' + JSON.stringify(ea1) +
                      '\n' + JSON.stringify(ea2));
    }
  });
}


function assertModelBuilderHasElements(modelBuilder, elements,
                                       opt_orderMatters) {
  assertElementArraysEqual(modelBuilder.getModelElements(), elements,
                           modelBuilder.getDimensions(), opt_orderMatters);
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

        assertModelBuilderHasElements(modelBuilder, elements);

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
      it('should clear redos', function () {
        makeEdits(modelBuilder);
        modelBuilder.undo();

        assert(modelBuilder.hasRedos());

        modelBuilder.commitChanges([{
          action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
          elements: [{ x: 2, y: 2, color: '#0000FF' }]
        }]);

        assert(!modelBuilder.hasRedos());
      });
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

      assertModelBuilderHasElements(modelBuilder, [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 0, color: '#FF0000' }
      ]);
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
      assertModelBuilderHasElements(modelBuilder, elements);
      
      modelBuilder.move({ x: -1, y: -1 });
      modelBuilder.resize({ width: 2, height: 2 });

      elements = [
        { x: 1, y: 1, color: '#FF0000' }
      ];
      assertModelBuilderHasElements(modelBuilder, elements);
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
      assertModelBuilderHasElements(modelBuilder, modelObj.elements);
    }
  );


  it('should set callback to be called on mouse move actions on mousemove',
    function () {
      var canvasActionSpy = sinon.spy();
      modelBuilder.afterCanvasAction(canvasActionSpy);
      EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });

      assert(canvasActionSpy.calledOnce);
    }
  );


  it('should not call callback to on NONE actions',
    function () {
      var canvasActionSpy = sinon.spy();
      modelBuilder.afterCanvasAction(canvasActionSpy);
      modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.NONE);
      EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });

      assert(!canvasActionSpy.called);
    }
  );


  it('should build the current change on "canvas.action" events', function () {
    var expectedElements = [
      { x: 0, y: 1, color: '#000000' },
      { x: 1, y: 0, color: '#000000' },
      { x: 0, y: 0, color: '#000000' }
    ];

    makeEdits(modelBuilder);

    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(_.isEqual(modelBuilder.getCurrentChange(), {
      action: GridModel.MODEL_ACTIONS.SET,
      elements: [{ x: 0, y: 0, color: '#000000' }]
    }));
    assertModelBuilderHasElements(modelBuilder, expectedElements);

    modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.CLEAR);
    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(_.isEqual(modelBuilder.getCurrentChange(), {
      action: GridModel.MODEL_ACTIONS.CLEAR,
      elements: [{ x: 0, y: 0, color: '#000000' }]
    }));

    expectedElements.splice(2, 1);
    assertModelBuilderHasElements(modelBuilder, expectedElements);
  });


  it('should fill areas on "canvas.action" with FILL as active change',
    function () {
      makeEdits(modelBuilder);

      modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.FILL);
      modelBuilder.setCurrentElement({ color: '#0000FF' });
      EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });

      var expectedElements = [
        { x: 0, y: 0, color: '#0000FF' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 1, color: '#000000' }
      ];
      assertElementArraysEqual(expectedElements,
                               modelBuilder.getModelElements(),
                               modelBuilder.getDimensions());
    }
  );


  it('should build and commit the current change on "canvas.release" events',
    function () {
      makeEdits(modelBuilder);
      modelBuilder.resize({ width: 5, height: 5 });

      EventHub.trigger('canvas.release', { positions: [{ x: 3, y: 3 }] });

      var expectedElements = [
        { x: 0, y: 1, color: '#000000' },
        { x: 1, y: 0, color: '#000000' },
        { x: 0, y: 0, color: '#FF0000' },
        { x: 3, y: 3, color: '#000000' }
      ];
      assert(modelBuilder.getCurrentChange() === null);
      assertModelBuilderHasElements(modelBuilder, expectedElements);

      modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.CLEAR);
      EventHub.trigger('canvas.release', { positions: [{ x: 0, y: 0 }] });
      expectedElements.splice(2, 1);
      assert(modelBuilder.getCurrentChange() === null);
      assertModelBuilderHasElements(modelBuilder, expectedElements);
    }
  );


  describe('paint', function () {
    var stub;
    beforeEach(function () {
      stub = sinon.stub();
    });

    it('should paint all elements within builder frame to the canvas',
      function () {
        makeEdits(modelBuilder);
        modelBuilder.resize({ width: 5, height: 5 });

        EventHub.trigger('canvas.action', { positions: [{ x: 3, y: 3 }] });

        EventHub.subscribe('modelbuilder.redraw', stub);
        modelBuilder.paint();

        var expectedElements = [
          { x: 0, y: 1, color: '#000000' },
          { x: 1, y: 0, color: '#000000' },
          { x: 0, y: 0, color: '#FF0000' },
          { x: 3, y: 3, color: '#000000' }
        ];

        assertElementArraysEqual(mockCanvas.getRenderedPixels(),
                                 expectedElements,
                                 modelBuilder.getDimensions());
        assert(stub.calledOnce);
      }
    );

    afterEach(function () {
      EventHub.unsubscribe('modelbuilder.redraw', stub);
    });
  });


  describe('redo', function () {
    context('when there are no redos in the redo stack', function () {
      it('should do nothing', function () {
        modelBuilder.redo();
        assert(modelBuilder.getModelElements().length === 0);
      });
    });


    context('when there are redos in the redo stack', function () {
      it('should process redos on the stack in order', function () {
        makeEdits(modelBuilder);
        modelBuilder.undo();
        modelBuilder.undo();

        var expectedElements = [
          { x: 0, y: 0, color: '#FF0000' },
          { x: 0, y: 1, color: '#000000' },
          { x: 1, y: 0, color: '#000000' },
          { x: 1, y: 1, color: '#000000' }
        ];

        modelBuilder.redo();
        assertModelBuilderHasElements(modelBuilder, expectedElements);
        assert(modelBuilder.hasRedos());

        expectedElements.splice(3, 1);
        modelBuilder.redo();
        assertModelBuilderHasElements(modelBuilder, expectedElements);
        assert(!modelBuilder.hasRedos());
      });
    });
  });


  it('should update dimensions on resize', function () {
    modelBuilder.resize({ width: 100, height: 100 });
    assert(_.isEqual({ width: 100, height: 100 },
                     modelBuilder.getDimensions()));
    assert(_.isEqual({ width: 100, height: 100 },
                     mockCanvas.getDimensions()));
  });


  it('should set the action for currentChanges on setAction', function () {
    modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.FILL);
    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(modelBuilder.getCurrentChange().action ===
           GridModelBuilder.CONTROLLER_ACTIONS.FILL);

    modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.CLEAR);
    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(modelBuilder.getCurrentChange().action ===
           GridModelBuilder.CONTROLLER_ACTIONS.CLEAR);

    modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.GET);
    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(modelBuilder.getCurrentChange() === null);

    modelBuilder.setAction(GridModelBuilder.CONTROLLER_ACTIONS.NONE);
    EventHub.trigger('canvas.action', { positions: [{ x: 0, y: 0 }] });
    assert(modelBuilder.getCurrentChange() === null);
  });


  it('should set the current element on setCurrentElement', function () {
    modelBuilder.setCurrentElement({ x: 10, y: 1000, color: '#00FF00' });
    assert(_.isEqual(modelBuilder.getCurrentElement(), { color: '#00FF00' }));
  });


  describe('setDefaultElement', function () {
    var stub;
    beforeEach(function () {
      stub = sinon.stub();
    });

    it('should paint all elements within builder frame to the canvas',
      function () {
        EventHub.subscribe('modelbuilder.redraw', stub);
        modelBuilder.setDefaultElement({ x: 10, y: 1000, color: '#00FF00' });
        assert(_.isEqual(modelBuilder.getDefaultElement(),
               { color: '#00FF00' }));
        assert(stub.calledOnce);
      }
    );

    afterEach(function () {
      EventHub.unsubscribe('modelbuilder.redraw', stub);
    });
  });

  
  it('should undo last committed change on undo', function () {
    makeEdits(modelBuilder);

    modelBuilder.undo();

    var expectedElements = [
      { x: 0, y: 0, color: '#FF0000' },
      { x: 0, y: 1, color: '#000000' },
      { x: 1, y: 0, color: '#000000' },
      { x: 1, y: 1, color: '#000000' }
    ];

    assertModelBuilderHasElements(modelBuilder, expectedElements);
    assert(modelBuilder.hasRedos());
  });
});
