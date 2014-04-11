var assert = require('assert');
var requirejs = require('requirejs');
var _ = require('underscore');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var GridModel = requirejs('core/model/gridmodel');
var Encoder = requirejs('core/util/encoder');
var Frame = requirejs('core/util/frame');


function makeEdits(gridModel) {
  gridModel.applyChanges([
    {
      action: GridModel.MODEL_ACTIONS.SET,
      elements: [
        { x: 0, y: 0, color: '#FFFFFF' },
        { x: 1, y: 0, color: '#FFFFFF' },
        { x: 0, y: 1, color: '#FFFFFF' },
        { x: 1, y: 1, color: '#FFFFFF' }
      ]
    },
    {
      action: GridModel.MODEL_ACTIONS.CLEAR,
      elements: [
        { x: 1, y: 0, color: '#FFFFFF' },
        { x: 1, y: 1, color: '#FFFFFF' }
      ]
    },
    {
      action: GridModel.MODEL_ACTIONS.SET,
      elements: [
        { x: 1, y: 0, color: '#000000' },
      ]
    }
  ]);

  return [
    { x: 0, y: 0, color: '#FFFFFF' },
    { x: 0, y: 1, color: '#FFFFFF' },
    { x: 1, y: 0, color: '#000000' }
  ];
}


function assertModelHasElements(model, frame, elements, opt_changes) {
  var oa1 = model.getElements(frame, opt_changes ? opt_changes : []);
  var oa2 = elements;

  var modelPosition = model.getPosition();
  var dimensions = {};
  dimensions.width = modelPosition.dimensions.width + modelPosition.offset.x;
  dimensions.height = modelPosition.dimensions.height + modelPosition.offset.y;

  if (oa1.length !== oa2.length) {
    throw new Error('Pixel arrays not equivalent lengths');
  }

  oa1 = _.sortBy(oa1, function (p) {
    return Encoder.coordToScalar(model._offsetElement(p), dimensions);
  });
  oa2 = _.sortBy(oa2, function (p) {
    return Encoder.coordToScalar(model._offsetElement(p), dimensions);
  });

  var zipped = _.zip(oa1, oa2);

  _.each(zipped, function (pair) {
    if (!_.isEqual(pair[0], pair[1])) {
      throw new Error('Model does not have expected elements.');
    }
  });
}


describe('GridModel', function () {
  var gridModel;
  var frame;


  beforeEach(function () {
    gridModel = new GridModel();
    frame = new Frame({ width: 5, height: 5 }, { x: 0, y: 0 });
  });


  describe('applyChanges', function () {
    context('when applying "' + GridModel.MODEL_ACTIONS.SET + '" changes',
      function () {
        it('should set new elements to specified positions', function () {
          frame.resize({ width: 102, height: 1001 });
          frame.move({ x: -1, y: 0 });

          var setElements = [
            { x: 0, y: 0, color: '#FFFFFF' },
            { x: 100, y: 1000, color: '#FFFFFF' },
            { x: -1, y: 0, color: '#FFFFFF' }
          ];

          gridModel.applyChanges([{
            action: GridModel.MODEL_ACTIONS.SET,
            elements: setElements
          }]);

          var relativeElements = [
            { x: 1, y: 0, color: '#FFFFFF' },
            { x: 101, y: 1000, color: '#FFFFFF' },
            { x: 0, y: 0, color: '#FFFFFF' }
          ];
          var elements = gridModel.getElements(frame);

          assert(elements.length === 3);
          assertModelHasElements(gridModel, frame, relativeElements);
        });

        it('should overwrite existing elements', function () {
          frame.resize({ width: 102, height: 1001 });
          frame.move({ x: -1, y: 0 });

          var setElements = [
            { x: 0, y: 0, color: '#FFFFFF' },
            { x: 100, y: 1000, color: '#FFFFFF' },
            { x: -1, y: 0, color: '#FFFFFF' }
          ];

          var overrideElements = [
            { x: 0, y: 0, color: '#000000' },
            { x: 100, y: 1000, color: '#000000' },
          ];

          gridModel.applyChanges([
            {
              action: GridModel.MODEL_ACTIONS.SET,
              elements: setElements
            },
            {
              action: GridModel.MODEL_ACTIONS.SET,
              elements: overrideElements
            }
          ]);

          var relativeElements = [
            { x: 1, y: 0, color: '#000000' },
            { x: 101, y: 1000, color: '#000000' },
            { x: 0, y: 0, color: '#FFFFFF' }
          ];
          var elements = gridModel.getElements(frame);

          assert(elements.length === 3);
          assertModelHasElements(gridModel, frame, relativeElements);
        });
      }
    );

    context('when applying "' + GridModel.MODEL_ACTIONS.CLEAR + '"changes',
      function () {
        it('should clear elements if they exist in the model', function () {
          frame.resize({ width: 102, height: 1001 });
          frame.move({ x: -1, y: 0 });

          var setElements = [
            { x: 0, y: 0, color: '#FFFFFF' },
            { x: 100, y: 1000, color: '#FFFFFF' },
            { x: -1, y: 0, color: '#FFFFFF' }
          ];

          var clearElements = [
            { x: 100, y: 1000, color: '#FFFFFF' },
            { x: -1, y: 0, color: '#FFFFFF' }
          ];

          gridModel.applyChanges([
            {
              action: GridModel.MODEL_ACTIONS.SET,
              elements: setElements
            },
            {
              action: GridModel.MODEL_ACTIONS.CLEAR,
              elements: clearElements
            }
          ]);

          var relativeElements = [{ x: 1, y: 0, color: '#FFFFFF' }];
          var elements = gridModel.getElements(frame);

          assert(elements.length === 1);
          assertModelHasElements(gridModel, frame, relativeElements);
        });


        it('should do nothing if cleared elements don\'t exist', function () {
          frame.resize({ width: 102, height: 1001 });
          frame.move({ x: -1, y: 0 });

          var setElements = [
            { x: 0, y: 0, color: '#FFFFFF' },
            { x: 100, y: 1000, color: '#FFFFFF' },
            { x: -1, y: 0, color: '#FFFFFF' }
          ];

          var clearElements = [
            { x: 101, y: 1000, color: '#FFFFFF' },
            { x: -1, y: -1, color: '#FFFFFF' }
          ];

          gridModel.applyChanges([
            {
              action: GridModel.MODEL_ACTIONS.SET,
              elements: setElements
            },
            {
              action: GridModel.MODEL_ACTIONS.CLEAR,
              elements: clearElements
            }
          ]);

          var relativeElements = [
            { x: 1, y: 0, color: '#FFFFFF' },
            { x: 101, y: 1000, color: '#FFFFFF' },
            { x: 0, y: 0, color: '#FFFFFF' }
          ];
          var elements = gridModel.getElements(frame);

          assert(elements.length === 3);
          assertModelHasElements(gridModel, frame, relativeElements);
        });
      }
    );
  });


  describe('clear', function () {
    it('should remove all elements from the GridModel', function () {
      makeEdits(gridModel);
      gridModel.clear();
      assert(gridModel.getElements(frame).length === 0);
    });
  });


  describe('getElements', function () {
    context('when no additional changes supplied', function () {
      it('should return elements within the frame relative to the frame',
        function () {
          var expectedElements = makeEdits(gridModel);

          debugger;
          assertModelHasElements(gridModel, frame, expectedElements);

          frame.resize({ width: 2, height: 1 });
          frame.move({ x: 0, y: 1 });

          expectedElements = [{ x: 0, y: 1, color: '#FFFFFF' }];

          assertModelHasElements(gridModel, frame, expectedElements);
        }
      );
    });

    context('when additional changes are supplied', function () {
      it('should return elements from the model and the changes', function () {
        var expectedElements = makeEdits(gridModel);
        var changeElement = { x: 3, y: 3, color: '#7777777' };
        var changes = [{
          action: GridModel.MODEL_ACTIONS.SET,
          elements: [changeElement]
        }];

        expectedElements.push(changeElement);

        assertModelHasElements(gridModel, frame, expectedElements, changes);
      });

      it('should not permanetly apply changes to the model', function () {
        var expectedElements = makeEdits(gridModel);
        var changeElement = { x: 3, y: 3, color: '#7777777' };
        var changes = [{
          action: GridModel.MODEL_ACTIONS.SET,
          elements: [changeElement]
        }];

        gridModel.getElements(frame, changes);
        assertModelHasElements(gridModel, frame, expectedElements, changes);
      });
    });
  });
});
