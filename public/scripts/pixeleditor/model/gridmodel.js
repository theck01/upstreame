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
    CLEAR_ALL: 'clear all',
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


  // _createElementMap generates a map from encoded element coordinates to
  // elements.
  //
  // Arguments:
  //   opt_elements: Optional array of objects with at least 'x', 'y' and
  //                 'color' fields.
  GridModel.prototype._createElementMap = function (opt_elements) {
    return _.reduce(opt_elements || this._elements, function (map, e) {
      map[Encoder.coordToScalar(this._offsetElement(e), this._dim)] = e;
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
      if (change.action === GridModel.MODEL_ACTIONS.CLEAR_ALL) {
        existingElementMap = Object.create(null);
        return;
      }

      _.each(change.elements, function (e) {
        var offsetCoord = this._offsetElement(e);

        // If the element will not fit into the model dimensions, update
        // dimensions to allow element to be inserted.
        if (offsetCoord.x >= this._dim.width || offsetCoord.x < 0 ||
            offsetCoord.y >= this._dim.height || offsetCoord.y < 0) {
          this._updateSizing(offsetCoord);
          existingElementMap = this._createElementMap(
              _.values(existingElementMap));
          offsetCoord = this._offsetElement(e);
        }

        var encoded = Encoder.coordToScalar(offsetCoord, this._dim);

        if (change.action === GridModel.MODEL_ACTIONS.CLEAR &&
            _.has(existingElementMap, encoded)) {
          delete existingElementMap[encoded];
        }
        else if (change.action === GridModel.MODEL_ACTIONS.SET) {
          existingElementMap[encoded] = e;
        }
      }, this);
    }, this);

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
      if (frame.containsCoord(e)) {
        memo.push(_.extend(_.clone(e), frame.relativePosition(e)));
      }
      return memo;
    }, []);
  };


  // getPosition returns the current offset and dimensions maintained by the
  // GridModel instance
  //
  // Returns an object with 'offset' and  'dimensions' fields
  GridModel.prototype.getPosition = function () {
    return {
      offset: _.clone(this._offset),
      dimensions: _.clone(this._dim)
    };
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


  // updateCoverage ensures that the model covers at least the area given by the
  // offset and dimensions, or more if elements already exist beyond the resize
  // area.
  //
  // Arguments:
  //    dimensions: Object with 'width' and 'height' fields
  //    offset: Object with positive integer 'x' and 'y' fields
  GridModel.prototype.updateCoverage = function (dimensions, offset) {
    this._offset.x = Math.max(this._offset.x, offset.x);
    this._offset.y = Math.max(this._offset.y, offset.y);
    this._dim.width = Math.max(this._dim.width, dimensions.width);
    this._dim.height = Math.max(this._dim.height, dimensions.height);
  };


  // _updateSizing updates the dimensions and offset of the model object to
  // fit the new coordinate.
  //
  // Arguments:
  //    offsetCoord: The offset coordinate tha does not fit within the existing
  //                 model dimensions.
  GridModel.prototype._updateSizing = function (offsetCoord) {
    if (offsetCoord.x < 0) {
      this._offset.x += -offsetCoord.x;
      this._dim.width += -offsetCoord.x;
    }
    else if (this._dim.width <= offsetCoord.x) {
      this._dim.width = offsetCoord.x + 1;
    }
    if (offsetCoord.y < 0) {
      this._offset.y += -offsetCoord.y;
      this._dim.height += -offsetCoord.y;
    }
    else if (this._dim.height <= offsetCoord.y) {
      this._dim.height = offsetCoord.y + 1;
    }
  };


  return GridModel;
});
