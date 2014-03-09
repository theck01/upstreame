define(["jquery", "underscore", "core/graphics/color", "core/util/subscriber",
        "core/util/encoder", "core/util/eventhub"],
  function($, _, Color, Subscriber, Encoder, EventHub){


    // applyChanges applies an array of changes to the model
    //
    // Arguments:
    //   changeset: Array of objects with 'action' and 'elements' fields
    //   elements: Array of objects with which to update the model, each
    //             with at least 'x', 'y', and 'color' fields
    //   dim: dimensions of the model
    // Returns final elements after applying changes
    function applyChanges (changeset, elements, dim) {
      var existingElementMap = _.reduce(elements, function (map, e) {
        if (e.x < dim.width && e.x >= 0 && e.y < dim.height && e.y >= 0) {
          map[Encoder.coordToScalar(e, dim)] = e;
        }
        return map;
      }, Object.create(null));

      _.each(changeset, function (change) {
        if (change.action === "clear all" || change.action === "import") {
          existingElementMap = Object.create(null);
        }
        if (change.action === "clear all") return;

        _.each(change.elements, function (e) {
          if (e.x >= dim.width || e.x < 0 || e.y >= dim.height || e.y < 0) {
            return;
          }
          var encoded = Encoder.coordToScalar(e, dim);

          if (change.action === "clear" &&
              _.has(existingElementMap, encoded)) {
            delete existingElementMap[encoded];
          }
          else if (change.action === "set" || change.action === "import" ||
                   change.action === "fill") {
            existingElementMap[encoded] = e;
          }
        });
      });

      return _.values(existingElementMap);
    }


    // fillArea performs a fill operation on a region of elements of the same
    // color 
    //
    // Arguments:
    //   elements: array of elements in the current model
    //   loc: location of initial fill operation
    //   dim: dimensions of canvas
    //   fillElement: element to fill
    // Returns an array of pixels that are affected by the fill operation
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

    
    // ModelBuilder provides methods for creating models in the browser and
    // exporting that model as a JSON string, using a PixelCanvas instance to
    // render a representation of the model in progress
    //
    // Constructor Arguments;
    //   pixelCanvas: PixelCanvas instance
    //   defaultElement: default element for all unspecified elements within
    //                   the model, containing at least 'color' field
    //   initialElement: initial element to begin buidling model, containing at
    //                   least 'color' field
    //   converter: A converter object with toCommonModelFormat and
    //              fromCommonModelFormat methods
    var ModelBuilder = function (pixelCanvas, defaultElement,
                                 initialElement, converter) {
      Subscriber.call(this);

      this.action = "set";
      this.converter = converter;
      this.currentChange = null; // always null unless mouse is down in canvas
      this.currentElement = _.omit(initialElement, "x", "y");
      this.defaultElement = _.omit(defaultElement, "x", "y");
      this.dim = pixelCanvas.getDimensions();
      this.elements = [];
      this.pCanvas = pixelCanvas;
      this.redoStack = [];
      this.showGrid = true;
      this.undoStack = [];

      this.register("canvas.action", this._onCanvasAction.bind(this));
      this.register("canvas.release", this._onCanvasRelease.bind(this));
    };
    ModelBuilder.prototype = Object.create(Subscriber.prototype);
    ModelBuilder.prototype.constructor = ModelBuilder;


    // clear removes all elements from the model
    ModelBuilder.prototype.clear = function () {
      this.commitChange({ action: "clear all" });
      this.pCanvas.clear();
      this.paint();
    };


    // commitChange commits the argument change, or the current changeset
    // being constructed
    //
    // Arguments:
    //   change: Optional, change to commit. If unspecified commit currentChange
    //   preserveRedoStack: optional, if true does not clear redo stack on
    //   commit
    ModelBuilder.prototype.commitChange = function (change,
                                                    preserveRedoStack) {
      if (!change) {
        change = this.currentChange;
        this.currentChange = null;
      }

      this.elements = applyChanges([change], this.elements, this.dim);
      if (!preserveRedoStack) this.redoStack = [];
      this.undoStack.push(change);
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
    ModelBuilder.prototype.exportModel = function () {
      var model = {
        defaultElement: this.defaultElement,
        currentElement: this.currentElement,
        dimensions: this.dim,
        elements: _.filter(this.elements, function (e) {
        return e.x >=0 && e.x < this.dim.width && e.y >= 0 &&
               e.y < this.dim.height;
        }, this)
      };

      return JSON.stringify(this.converter.fromCommonModelFormat(model));
    };


    // getDefaultElement returns the default element used for all unset
    // elements in the model
    //
    // Returns:
    //   An object with at least a 'color' field
    ModelBuilder.prototype.getDefaultElement = function () {
      return this.defaultElement;
    };


    // getCurrentElement returns the currentElement that will be used to
    // create constructive changes
    //
    // Returns:
    //   An object with at least a 'color' field
    ModelBuilder.prototype.getCurrentElement = function () {
      return this.currentElement;
    };


    // importModel loads an model JSON string saved using exportModel 
    ModelBuilder.prototype.importModel = function (modelJSON) {
      var model = this.converter.toCommonModelFormat(JSON.parse(modelJSON));

      this.setDefaultElement(model.defaultElement);
      this.setCurrentElement(model.currentElement);
      this.resize(model.dimensions.width, model.dimensions.height);
      this.commitChange({ action: "import", elements: model.elements });

      this.paint();
    };


    // mousemove registers mousemove callback for canvas to run after the body
    // PixelCanvas onclick event has run
    //
    // Arguments:
    //   callbackFunction: A function that may optionally take a jQuery click
    //                     event to do further processing with the click
    ModelBuilder.prototype.mousemove = function (callbackFunction) {
      this.mouseMoveAction = callbackFunction;
    };


    // _onCanvasAction listens updates change state when 'canvas.action' event
    // is fired
    ModelBuilder.prototype._onCanvasAction = function (params) {
      var coords = params.positions;
      this.currentChange = Object.create(null);

      if (this.action === "get") {
        var element = this.elements[Encoder.coordToScalar(_.last(coords))] ||
                      this.defaultElement;
        this.setCurrentElement(element);
        return;
      }
      else if (this.action === "set" || this.action === "clear") {
        this.currentChange.elements = _.map(params.positions, function (p) {
          return _.extend(_.clone(this.currentElement), p);
        }, this);
        this.currentChange.action = this.action;
        this.paint();
      }
      else if (this.action === "fill") {
        this.currentChange.elements = fillArea(this.elements, _.last(coords),
                                               this.dim, this.currentElement);
        this.currentChange.action = this.action;
        this.paint();
      }
    };


    // _onCanvasAction listens commits change state when 'canvas.action' event
    // is fired
    ModelBuilder.prototype._onCanvasRelease = function (params) {
      this._onCanvasAction(params);
      if (!this.currentChange.elements || !this.currentChange.action) return;
      this.commitChange();
    };


    // paint writes all stored pixels to the PixelCanvas and calls the
    // PixelCanvas" paint method
    ModelBuilder.prototype.paint = function () {
      var elements;

      if (this.currentChange) {
        elements = applyChanges([this.currentChange], this.elements, this.dim);
      }
      else elements = this.elements;

      _.each(elements, function(e) {
        if (e.x >= 0 && e.x < this.dim.width && e.y >= 0 &&
            e.y < this.dim.height) {
          this.pCanvas.setPixel(e.x, e.y, e.color);
        }
      }, this);

      this.pCanvas.clear();
      this.pCanvas.paint();
      EventHub.trigger("modelbuilder.redraw");
    };



    // redo reapplys a change removed by an undo command if such a change
    // exists
    ModelBuilder.prototype.redo = function () {
      if (this.redoStack.length === 0) return;
      var change = this.redoStack.pop();
      this.elements = applyChanges([change], this.elements, this.dim);
      this.commitChange(change, true);
      this.paint();
    };


    // resize resizes the number of meta-pixels available for drawing
    // on the canvas element
    //
    // Arguments:
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    ModelBuilder.prototype.resize = function (width, height){
      this.dim = { width: width, height: height };
      this.pCanvas.resize(this.dim);

      if (this.undoStack.length !== 0) {
        this.elements = applyChanges(this.undoStack, [], this.dim);
      }

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
    ModelBuilder.prototype.setAction = function (actionString) {
      this.action = actionString;
    };


    // setDefaultElement sets the element to be used for locations unset
    // within the model.
    //
    // Arguments:
    //   element: an object with at least 'color' field
    ModelBuilder.prototype.setDefaultElement = function (element) {
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
    ModelBuilder.prototype.setCurrentElement = function (element) {
      this.currentElement = _.omit(element, "x", "y");
      this.currentElement.color = Color.sanitize(this.currentElement.color);
    };


    // undo removes the most recent change and places it in the redoStack
    ModelBuilder.prototype.undo = function () {
      if (this.undoStack.length === 0) return;
      this.redoStack.push(this.undoStack.pop());
      this.elements = applyChanges(this.undoStack, [], this.dim);
      this.paint();
    };

    return ModelBuilder;
  }
);
