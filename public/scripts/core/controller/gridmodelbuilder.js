define(["underscore", "core/graphics/color", "core/model/gridmodel",
        "core/util/subscriber", "core/util/frame", "core/util/encoder",
        "core/controller/eventhub"],
  function(_, Color, GridModel, Subscriber, Frame, Encoder, EventHub){


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

      this.action = GridModelBuilder.CONTROLLER_ACTIONS.SET;
      this.converter = converter;
      this.currentChange = null; // always null unless mouse is down in canvas
      this.model = model;
      this.pCanvas = pixelCanvas;
      this.redoStack = [];
      this.undoStack = [];

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
      FILL: "fill",
      GET: "get",
      SET: GridModel.MODEL_ACTIONS.SET
    };


    // clear removes all elements from the model within the GridModelBuilder
    // frame.
    GridModelBuilder.prototype.clear = function () {
      this.commitChanges([{
        action: GridModel.MODEL_ACTIONS.CLEAR,
        elements: this._elementsToClear()
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
        changes = [this.currentChange];
        this.currentChange = null;
      }
      this.model.applyChanges(changes);
      if (!preserveRedoStack) this.redoStack = [];
      this.undoStack.push(changes);
    };


    // _elementsToClear returns an array containing elements for all
    // coordinates within the controller's dimensions.
    GridModelBuilder.prototype._elementsToClear = function () {
      var dim = this.getDimensions();

      var elementsToClear = [];
      for (var i=0; i<dim.width; i++) {
        for (var j=0; j<dim.height; j++) {
          elementsToClear.push({ x: i, y: j, color: "#000000" });
        }
      }
      
      return elementsToClear;
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
        elements: this.model.getElements(this)
      };

      return JSON.stringify(this.converter.fromCommonModelFormat(model));
    };


    // getDefaultElement returns the default element used for all unset
    // elements in the model
    //
    // Returns:
    //   An object with at least a 'color' field
    GridModelBuilder.prototype.getDefaultElement = function () {
      return this.defaultElement;
    };


    // getCurrentElement returns the currentElement that will be used to
    // create constructive changes
    //
    // Returns:
    //   An object with at least a 'color' field
    GridModelBuilder.prototype.getCurrentElement = function () {
      return this.currentElement;
    };


    // getModelElements returns the model elements contained within the bounds
    // of the GridModelBuilder frame
    //
    // Returns an array containing objects with at least 'x', 'y', and 'color'
    // fields
    GridModelBuilder.prototype.getModelElements = function () {
      var changes = this.currentChange ? [this.currentChange] : [];
      return this.model.getElements(this, changes);
    };


    // importModel loads an model JSON string saved using exportModel 
    GridModelBuilder.prototype.importModel = function (modelJSON) {
      var modelObj = this.converter.toGridModelFormat(JSON.parse(modelJSON));

      this.setDefaultElement(modelObj.defaultElement);
      this.setCurrentElement(modelObj.currentElement);
      this.resize(modelObj.dimensions.width, modelObj.dimensions.height);
      this.commitChanges([
        { action: GridModel.MODEL_ACTIONS.CLEAR,
          elements: this._elementsToClear() },
        { action: GridModel.MODEL_ACTIONS.SET,
          elements: this._modelObj.elements }
      ]);

      this.paint();
    };


    // mousemove registers mousemove callback for canvas to run after the body
    // PixelCanvas onclick event has run
    //
    // Arguments:
    //   callbackFunction: A function that may optionally take a jQuery click
    //                     event to do further processing with the click
    GridModelBuilder.prototype.mousemove = function (callbackFunction) {
      this.mouseMoveAction = callbackFunction;
    };


    // _onCanvasAction listens updates change state when 'canvas.action' event
    // is fired
    GridModelBuilder.prototype._onCanvasAction = function (params) {
      var coords = params.positions;
      this.currentChange = Object.create(null);
      var mousePos = _.last(coords);

      if (this.action === GridModelBuilder.CONTROLLER_ACTIONS.GET) {
        var element = _.find(this.model.getElements(this), function (e) {
          return e.x === mousePos.x && e.y === mousePos.y;
        });
        element = element || this.defaultElement;
        this.setCurrentElement(element);
        return;
      }
      else if (this.action === GridModelBuilder.CONTROLLER_ACTIONS.SET ||
               this.action === GridModelBuilder.CONTROLLER_ACTIONS.CLEAR) {
        this.currentChange.elements = _.map(params.positions, function (p) {
          return _.extend(_.clone(this.currentElement), p);
        }, this);
        this.currentChange.action = this.action;
        this.paint();
      }
      else if (this.action === GridModelBuilder.CONTROLLER_ACTIONS.FILL) {
        this.currentChange.elements = fillArea(this.elements, mousePos,
                                               this.getDimensions(),
                                               this.currentElement);
        this.currentChange.action = GridModel.MODEL_ACTIONS.SET;
        this.paint();
      }
    };


    // _onCanvasAction listens commits change state when 'canvas.action' event
    // is fired
    GridModelBuilder.prototype._onCanvasRelease = function (params) {
      this._onCanvasAction(params);
      if (!this.currentChange.elements || !this.currentChange.action) return;
      this.commitChanges();
    };


    // paint writes all stored pixels to the PixelCanvas and calls the
    // PixelCanvas" paint method
    GridModelBuilder.prototype.paint = function () {
      var elements;

      var changes = this.currentChange ? [this.currentChange] : [];
      elements = this.model.getElements(this, changes);

      _.each(elements, function(e) {
        this.pCanvas.setPixel(e.x, e.y, e.color);
      }, this);

      this.pCanvas.clear();
      this.pCanvas.paint();
      EventHub.trigger("modelbuilder.redraw");
    };


    // redo reapplys a change removed by an undo command if such a change
    // exists
    GridModelBuilder.prototype.redo = function () {
      if (this.redoStack.length === 0) return;
      var changes = this.redoStack.pop();
      this.commitChanges(changes, true);
      this.paint();
    };


    // resize resizes the number of meta-pixels available for drawing
    // on the canvas element
    //
    // Arguments:
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    GridModelBuilder.prototype.resize = function (width, height){
      Frame.prototype.resize.call(this, { width: width, height: height });
      this.pCanvas.resize({ width: width, height: height });
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
        this.action = actionString;
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
      this.pCanvas.setBackgroundColor(this.defaultElement.color);
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
      if (this.undoStack.length === 0) return;
      this.redoStack.push(this.undoStack.pop());
      this.model.clear();
      this.model.applyChanges(_.flatten(this.undoStack));
      this.paint();
    };

    return GridModelBuilder;
  }
);
