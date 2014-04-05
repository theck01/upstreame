define(['underscore', 'core/util/encoder'], function (_, Encoder) {

  // GridModel is the base model used to create Sprites, Worlds, and other
  // grid based entities
  //
  // Arguments:
  //   opt_dimensions: Optional object with 'width' and 'height' fields, the
  //                   dimensions of the full model. Will be expanded as needed.
  var GridModel = function (opt_dimensions) {
    this._dim = _.clone(opt_dimensions) || { width: 1, height: 1 };
    this._elements = [];
    this._offset = { x: 0, y: 0 };
  };


  // actions available when applying changes to a GridModel
  GridModel.MODEL_ACTIONS = {
    CLEAR: 'clear',
    SET: 'set'
  };


  // applyChanges applies an array of changes to the model, mutating its
  // internal state.
  //
  // Arguments:
  //   changes: Array of objects with 'action' and 'elements' fields.
  //     action: An string value in the GridModel.MODEL_ACTION object.
  //     elements: An object with at least 'x', 'y' and 'color' fields.
  GridModel.prototype.applyChanges = function (changes) {
    this._elements = this._elementsWithChanges(changes);
  };


  // clear drops all elements within the model.
  GridModel.prototype.clear = function () {
    this._elements = [];
  };


  // _createElementMap generates a map from encoded element coordinates to
  // elements.
  //
  // Arguments:
  //   opt_elements: Optional array of objects with at least 'x', 'y' and
  //                 'color' fields.
  GridModel.prototype._createElementMap = function (opt_elements) {
    return _.reduce(opt_elements || this._elements, function (map, e) {
      map[Encoder.coordToScalar(e, this._dim)] = e;
      return map;
    }, Object.create(null), this);
  };


  // elementsWithChanges generates the array of elements created when applying
  // the changes to the internal model elements.
  //
  // Arguments:
  //   changes: Array of objects with 'action' and 'elements' fields.
  //     action: An string value in the GridModel.MODEL_ACTION object.
  //     elements: An object with at least 'x', 'y' and 'color' fields.
  // Returns an array of objects with at least 'x', 'y', and 'color' fields.
  GridModel.prototype._elementsWithChanges = function (changes) {
    var existingElementMap = this._createElementMap();

    _.each(changes, function (change) {
      _.each(change.elements, function (e) {
        var offsetCoord = this._offsetElement(e);

        // If the element will not fit into the model dimensions, update
        // dimensions to allow element to be inserted.
        if (offsetCoord.x >= this._dim.width || offsetCoord.x < 0 ||
            offsetCoord.y >= this._dim.height || offsetCoord.y < 0) {
          this._updateSizing(offsetCoord);
          existingElementMap = this._createElementMap(
              _.values(existingElementMap));
        }

        var encoded = Encoder.coordToScalar(e, this._dim);

        if (change.action === GridModel.MODEL_ACTIONS.CLEAR &&
            _.has(existingElementMap, encoded)) {
          delete existingElementMap[encoded];
        }
        else if (change.action === GridModel.MODEL_ACTIONS.SET) {
          existingElementMap[encoded] = e;
        }
      });
    });

    return _.values(existingElementMap);
  };


  // getElements within the window given by the Frame instance, in coordinates
  // relative to the frame instance.
  //
  // Arguments:
  //   frame: The frame within which returns elements must lie.
  //   opt_changes: Optional set of changes to apply to the elements before
  //                retrieval.
  // Returns an array of objects with at least 'x', 'y', and 'color' fields.
  GridModel.prototype.getElements = function (frame, opt_changes) {
    var elements = opt_changes ?
      this._elementsWithChanges(opt_changes) : this._elements;

    return _.reduce(elements, function (memo, e) {
      if (frame.contains(e)) {
        memo.push(_.extend(_.clone(e), frame.relativePosition(e)));
      }
      return memo;
    }, []);
  };


  // _offsetElement returns the coordinate location of the element offset by
  // the internal model offset.
  //
  // Arguments:
  //   element: object with at least 'x', 'y', and 'color' fields.
  // Returns an object with 'x' and 'y' fields.
  GridModel.prototype._offsetElement = function (element) {
    return { x: element.x + this._offset.x, y: element.y + this._offset.y };
  };


  // _updateSizing updates the dimensions and offset of the model object to
  // fit the new coordinate.
  //
  // Arguments:
  //    offsetCoord: The offset coordinate tha does not fit within the existing
  //                 model dimensions.
  //    opt_elements: Optional An array of objects with 'x', 'y' and 'color'
  //                  fields. Internal state will be used if argument is not
  //                  specified.
  GridModel.prototype._updateSizing = function (offsetCoord, opt_elements) {
    this._dim = { width: offsetCoord.x, height: offsetCoord.y };

    if (offsetCoord.x < 0) {
      this._offset.x += -1 * offsetCoord.x;
      this._dim.width = 0;
    }
    if (offsetCoord.y < 0) {
      this._offset.y += -1 * offsetCoord.y;
      this._dim.width = 0;
    }

    _.each(opt_elements || this._elements, function (e) {
      var offsetElement = this._offsetElement(e);
      this._dim.x = Math.max(this._dim.width, offsetElement.x);
      this._dim.y = Math.max(this._dim.height, offsetElement.y);
    }, this);
  };


  return GridModel;
});
