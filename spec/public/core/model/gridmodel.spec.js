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


function elementArraysEqual(ary1, ary2) {
  return _.reduce(ary1, function (memo, e1) {
    return memo && _.find(ary2, function (e2) {
      return _.isEqual(e1, e2);
    });
  }, true);
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
          assert(elementArraysEqual(elements, relativeElements));
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
          assert(elementArraysEqual(elements, relativeElements));
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
          assert(elementArraysEqual(elements, relativeElements));
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
          assert(elementArraysEqual(elements, relativeElements));
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

          assert(elementArraysEqual(gridModel.getElements(frame),
                                    expectedElements));

          frame.resize({ width: 2, height: 1 });
          frame.move({ x: 0, y: 1 });

          expectedElements = [{ x: 0, y: 1, color: '#FFFFFF' }];

          assert(elementArraysEqual(gridModel.getElements(frame),
                                    expectedElements));
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

        assert(elementArraysEqual(gridModel.getElements(frame, changes),
                                  expectedElements));
      });

      it('should not permanetly apply changes to the model', function () {
        var expectedElements = makeEdits(gridModel);
        var changeElement = { x: 3, y: 3, color: '#7777777' };
        var changes = [{
          action: GridModel.MODEL_ACTIONS.SET,
          elements: [changeElement]
        }];

        gridModel.getElements(frame, changes);
        assert(elementArraysEqual(gridModel.getElements(frame),
                                  expectedElements));
      });
    });
  });
});
