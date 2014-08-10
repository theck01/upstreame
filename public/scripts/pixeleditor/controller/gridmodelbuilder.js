define(["underscore", "core/graphics/color", "core/util/subscriber",
        "core/util/frame", "core/util/encoder", "core/controller/eventhub",
        "pixeleditor/model/gridmodel"],
  function(_, Color, Subscriber, Frame, Encoder, EventHub, GridModel){


    // fillArea performs a fill operation on a region of elements of the same
    // color 
    //
    // Arguments:
    //   elements: array of elements in the current model
    //   loc: location of initial fill operation
    //   dim: dimensions of canvas
    //   fillElement: element to fill
    // Returns an array of elements that are added by the fill operation
    function fillArea (elements, loc, dim, fillElement) {
      var filledElements = Object.create(null);
      var locationStack = [loc];

      var existingElementMap = _.reduce(elements, function (map, e) {
        map[Encoder.coordToScalar(e, dim)] = e;
        return map;
      }, Object.create(null));

      var replacedElement = existingElementMap[Encoder.coordToScalar(loc, dim)];
      replacedElement = replacedElement || { color: undefined };

      while (locationStack.length > 0) {
        var pos = locationStack.pop();
        var scalarPos = Encoder.coordToScalar(pos, dim);

        if (pos.x >= dim.width || pos.x < 0 || pos.y >= dim.height ||
            pos.y < 0) {
          continue;
        }

        var existingElement = existingElementMap[scalarPos] ||
                              { color: undefined };

        if (existingElement.color === replacedElement.color &&
            filledElements[scalarPos] === undefined) {
          var newElement = _.extend(_.clone(fillElement),
                                    { x: pos.x, y: pos.y });
          filledElements[scalarPos] = newElement;
          locationStack = locationStack.concat([
            { x: pos.x+1, y: pos.y }, { x: pos.x-1, y: pos.y },
            { x: pos.x, y: pos.y+1 }, { x: pos.x, y: pos.y-1 }
          ]);
        }
      }

      return _.values(filledElements);
    }

    
    // GridModelBuilder provides methods for creating models in the browser and
    // exporting that model as a JSON string, using a PixelCanvas instance to
    // render a representation of the model in progress
    //
    // Constructor Arguments:
    //   model: GridModel instance
    //   pixelCanvas: PixelCanvas instance
    //   defaultElement: default element for all unspecified elements within
    //                   the model, containing at least 'color' field
    //   initialElement: initial element to begin buidling model, containing at
    //                   least 'color' field
    //   converter: A converter object with toGridModelFormat and
    //              fromGridModelFormat methods
    var GridModelBuilder = function (model, pixelCanvas, defaultElement,
                                     initialElement, converter) {
      Subscriber.call(this);
      Frame.call(this, pixelCanvas.getDimensions(), { x: 0, y: 0 });

      this._action = GridModelBuilder.CONTROLLER_ACTIONS.SET;
      this._converter = converter;
      this._currentChange = null; // always null unless mouse is down in canvas
      this._model = model;
      this._pCanvas = pixelCanvas;
      this._redoStack = [];
      this._undoStack = [];
      this._userCanvasActionCallback = function () {};

      this.setCurrentElement(initialElement);
      this.setDefaultElement(defaultElement);

      this.register("canvas.action", this._onCanvasAction.bind(this));
      this.register("canvas.release", this._onCanvasRelease.bind(this));
    };
    _.extend(GridModelBuilder.prototype, Frame.prototype, Subscriber.prototype);
    GridModelBuilder.prototype.constructor = GridModelBuilder;


    // Actions that the controller can perform on the model.
    GridModelBuilder.CONTROLLER_ACTIONS = {
      CLEAR: GridModel.MODEL_ACTIONS.CLEAR,
      CLEAR_ALL: "clear all",
      FILL: "fill",
      GET: "get",
      NONE: "none",
      SET: GridModel.MODEL_ACTIONS.SET
    };


    // afterCanvasAction registers mousemove callback for canvas to run after
    // the body PixelCanvas onclick event has run
    //
    // Arguments:
    //   callbackFunction: A function that takes zero arguments, to be called
    //                     after canvas actions.
    GridModelBuilder.prototype.afterCanvasAction = function (callbackFunction) {
      this._userCanvasActionCallback = callbackFunction;
    };


    // clear removes all elements from the model within the GridModelBuilder
    // frame.
    GridModelBuilder.prototype.clear = function () {
      this.commitChanges([{
        action: GridModelBuilder.CONTROLLER_ACTIONS.CLEAR_ALL,
        elements: []
      }]);
      this.paint();
    };


    // commitChanges commits the argument changes, or the current changeset
    // being constructed
    //
    // Arguments:
    //   changes: Optional, Array of changes to commit, which are objects
    //            with 'action' field (any GridModel.MODEL_ACTION) and
    //            'elements' field. Defaults to an array containing
    //            currentChange
    //   preserveRedoStack: Optional, if true does not clear redo stack on
    //                      commit
    GridModelBuilder.prototype.commitChanges = function (changes,
                                                         preserveRedoStack) {
      if (!changes) {
        changes = [this._currentChange];
        this._currentChange = null;
      }
      var modelChanges = this._preprocessChanges(changes);
      this._model.applyChanges(modelChanges);
      if (!preserveRedoStack) this._redoStack = [];
      this._undoStack.push(changes);
    };


    // exportModel generates a JSON string of all elements set in the model
    // with additional meta-data about minimum model size required to
    // capture all elements
    //
    // Returns a JSON string representing an object the following fields:
    //   defaultElement: defaultElement used when editing
    //   currentElement: currentElement used during edits
    //   dimensions: dimensions of the model used during editing, object with
    //               width and height fields
    //   elements: An array of objects with at least x, y, and color fields
    GridModelBuilder.prototype.exportModel = function () {
      var model = {
        defaultElement: this.defaultElement,
        currentElement: this.currentElement,
        dimensions: this.getDimensions(),
        elements: this._model.getElements(this)
      };

      return JSON.stringify(this._converter.fromCommonModelFormat(model));
    };


    // getCurrentChange returns the pending change that has yet to be committed
    // to the model.
    //
    // Returns an object with at 'elements' and 'action' fields.
    GridModelBuilder.prototype.getCurrentChange = function () {
      return _.clone(this._currentChange);
    };


    // getCurrentElement returns the currentElement that will be used to
    // create constructive changes
    //
    // Returns:
    //   An object with at least a 'color' field
    GridModelBuilder.prototype.getCurrentElement = function () {
      return this.currentElement;
    };


    // getDefaultElement returns the default element used for all unset
    // elements in the model
    //
    // Returns:
    //   An object with at least a 'color' field
    GridModelBuilder.prototype.getDefaultElement = function () {
      return this.defaultElement;
    };


    // getModelElements returns the model elements contained within the bounds
    // of the GridModelBuilder frame
    //
    // Returns an array containing objects with at least 'x', 'y', and 'color'
    // fields
    GridModelBuilder.prototype.getModelElements = function () {
      var changes = this._currentChange ? [this._currentChange] : [];
      changes = this._preprocessChanges(changes);
      return this._model.getElements(this, changes);
    };


    // hasRedos returns true if the builder has redos available, false if not.
    //
    // Returns a boolean.
    GridModelBuilder.prototype.hasRedos = function () {
      return this._redoStack.length > 0;
    };


    // importModel loads an model JSON string saved using exportModel 
    GridModelBuilder.prototype.importModel = function (modelJSON) {
      var modelObj = this._converter.toCommonModelFormat(JSON.parse(modelJSON));

      this.setDefaultElement(modelObj.defaultElement);
      this.setCurrentElement(modelObj.currentElement);
      this.resize(modelObj.dimensions);
      this.commitChanges([
        { action: GridModelBuilder.CONTROLLER_ACTIONS.CLEAR_ALL,
          elements: [] },
        { action: GridModelBuilder.CONTROLLER_ACTIONS.SET,
          elements: modelObj.elements }
      ]);

      this.paint();
    };


    // _onCanvasAction listens updates change state when 'canvas.action' event
    // is fired
    GridModelBuilder.prototype._onCanvasAction = function (params) {
      var coords = params.positions;
      this._currentChange = null;
      var mousePos = _.last(coords);
      var elements;
      
      if (this._action === GridModelBuilder.CONTROLLER_ACTIONS.NONE) {
        return;
      }
      else if (this._action === GridModelBuilder.CONTROLLER_ACTIONS.GET) {
        var element = _.find(this._model.getElements(this), function (e) {
          return e.x === mousePos.x && e.y === mousePos.y;
        });
        element = element || this.defaultElement;
        this.setCurrentElement(element);
      }
      else if (this._action === GridModelBuilder.CONTROLLER_ACTIONS.SET ||
               this._action === GridModelBuilder.CONTROLLER_ACTIONS.CLEAR) {
        elements = _.map(params.positions, function (p) {
          return _.extend(_.clone(this.currentElement), p);
        }, this);
        this._currentChange = { action: this._action, elements: elements };
        this.paint();
      }
      else if (this._action === GridModelBuilder.CONTROLLER_ACTIONS.FILL) {
        elements = [_.extend(_.clone(this.currentElement), mousePos)];
        this._currentChange = { action: this._action, elements: elements };
        this.paint();
      }
      
      this._userCanvasActionCallback();
    };


    // _onCanvasAction listens commits change state when 'canvas.action' event
    // is fired
    GridModelBuilder.prototype._onCanvasRelease = function (params) {
      this._onCanvasAction(params);
      if (!this._currentChange) return;
      this.commitChanges();
    };


    // paint writes all stored pixels to the PixelCanvas and calls the
    // PixelCanvas" paint method
    GridModelBuilder.prototype.paint = function () {
      var elements = this.getModelElements();
      _.each(elements, function(e) {
        this._pCanvas.setPixel(e.x, e.y, e.color);
      }, this);

      this._pCanvas.clear();
      this._pCanvas.paint();
      EventHub.trigger("modelbuilder.redraw");
    };


    // preprocessChanges converts GridModelBuilder changes into GridModel
    // changes.
    //
    // Arguments: Array of objects with 'action' and 'elements' fields
    GridModelBuilder.prototype._preprocessChanges = function (changes) {
      return _.reduce(changes, function (memo, c) {
        var modelChange = _.clone(c);
        switch (modelChange.action) {
          case GridModelBuilder.CONTROLLER_ACTIONS.CLEAR:
            modelChange.action = GridModel.MODEL_ACTIONS.CLEAR;
            break;

          case GridModelBuilder.CONTROLLER_ACTIONS.CLEAR_ALL:
            this._model.clear();
            return memo;

          case GridModelBuilder.CONTROLLER_ACTIONS.FILL:
            var elementsToThisChange = this._model.getElements(this, memo);
            modelChange.action = GridModel.MODEL_ACTIONS.SET;
            modelChange.elements= fillArea(elementsToThisChange,
                                           modelChange.elements[0],
                                           this.getDimensions(),
                                           this.currentElement);
            break;

          case GridModelBuilder.CONTROLLER_ACTIONS.SET:
            modelChange.action = GridModel.MODEL_ACTIONS.SET;
            break;

          default:
            throw Error("Bad controller action, cannot process change");
        }

        memo.push(modelChange);
        return memo;
      }, [], this);
    };


    // redo reapplys a change removed by an undo command if such a change
    // exists
    GridModelBuilder.prototype.redo = function () {
      if (this._redoStack.length === 0) return;
      var changes = this._redoStack.pop();
      this.commitChanges(changes, true);
      this.paint();
    };


    // resize resizes the number of meta-pixels available for drawing
    // on the canvas element
    //
    // Arguments:
    //   dimensions: object with 'width' and 'height' fields.
    GridModelBuilder.prototype.resize = function (dimensions){
      Frame.prototype.resize.call(this, dimensions);
      var origin = this.getOrigin();
      var offset = {
        x: origin.x < 0 ? -origin.x : 0,
        y: origin.y < 0 ? -origin.y : 0
      };
      this._model.updateCoverage(this.getDimensions(), offset);
      this._pCanvas.resize(dimensions);
      this.paint();
    };


    // setAction sets the action that will be performed when a pixel is
    // clicked on
    //
    // Arguments:
    //   actionString: One of the following strings -
    //                 "clear", returns the pixel to the default color of the 
    //                          canvas
    //                 "get", returns the color of the pixel clicked on
    //                 "set", sets the color of the pixel clicked on
    //                 "fill", fills the like area around the clicked pixel
    GridModelBuilder.prototype.setAction = function (actionString) {
      if (_.has(_.invert(GridModelBuilder.CONTROLLER_ACTIONS), actionString)) {
        this._action = actionString;
      }
    };


    // setDefaultElement sets the element to be used for locations unset
    // within the model.
    //
    // Arguments:
    //   element: an object with at least 'color' field
    GridModelBuilder.prototype.setDefaultElement = function (element) {
      this.defaultElement = _.omit(element, "x", "y");
      this.defaultElement.color = Color.sanitize(this.defaultElement.color);
      this._pCanvas.setBackgroundColor(this.defaultElement.color);
      this.paint();
    };


    // setCurrentElement sets the element to be used for upcoming changes
    // made to the model.
    //
    // Arguments:
    //   element: an object with at least 'color' field
    GridModelBuilder.prototype.setCurrentElement = function (element) {
      this.currentElement = _.omit(element, "x", "y");
      this.currentElement.color = Color.sanitize(this.currentElement.color);
    };


    // undo removes the most recent change and places it in the redoStack
    GridModelBuilder.prototype.undo = function () {
      if (this._undoStack.length === 0) return;
      this._redoStack.push(this._undoStack.pop());
      this._model.clear();
      _.each(this._undoStack, function (changes) {
        changes = this._preprocessChanges(changes);
        this._model.applyChanges(changes);
      }, this);
      this.paint();
    };

    return GridModelBuilder;
  }
);
