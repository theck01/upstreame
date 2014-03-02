define(["jquery", "underscore", "core/graphics/pixelcanvas",
        "core/util/encoder"],
  function($, _, PixelCanvas, Encoder){


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

        if (change.action === "clear all") {
          existingElementMap = Object.create(null);
          return;
        }

        if (change.action === "import") {
          existingElementMap = Object.create(null);
        }

        _.each(change.elements, function (e) {
          if (e.x >= dim.width || e.x < 0 || e.y >= dim.height || e.y < 0) {
            return;
          }

          var encoded = Encoder.coordToScalar(e, dim);

          if (change.action === "clear" && existingElementMap[encoded]) {
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
    // render a representation of the model in progress.
    //
    // Constructor Arguments;
    //   dimensions: object with 'width' and 'height' fields
    //   canvasID: css selector style id of the canvas on the page
    //   defaultElement: default element for all unspecified elements within
    //                   the model, containing at least 'color' field
    //   initialElement: initial element to begin buidling model, containing at
    //                   least 'color' field
    var ModelBuilder = function (dimensions, canvasID, defaultElement,
                                 initialElement) {
      var that = this;

      this.$htmlCanvas = $(canvasID);
      this.action = "set";
      this.defaultElement = _.omit(defaultElement, 'x', 'y');
      this.canvasID = canvasID;
      this.currentChange = null; // always null unless mouse is down in canvas
      this.currentElement = _.omit(initialElement, 'x', 'y');
      this.dim = _.clone(dimensions);
      this.mouseDown = false;
      this.mouseMoveAction = function () {};
      this.pCanvas = new PixelCanvas(dimensions, canvasID,
                                     defaultElement.color);
      this.elements = [];
      this.redoStack = [];
      this.showGrid = true;
      this.undoStack = [];


      // on mouseup or mouseleave set mouseDown to false
      this.$htmlCanvas.on("mouseup mouseleave", function () {
        that.mouseDown = false;
        if (that.currentChange) {
          that.commitChange();
        }
      });


      // set up mouse listener for down and movement events
      this.$htmlCanvas.on("mousedown mousemove", function (e) {

        if(e.type === "mousedown") that.mouseDown = true;

        // if user is not currently clicking, do nothing
        if(!that.mouseDown) return;

        var canvasOffset = that.$htmlCanvas.offset();
        var relx = e.pageX - canvasOffset.left;
        var rely = e.pageY - canvasOffset.top;

        var sparams = that.pCanvas.screenParams();

        var x = Math.floor((relx - sparams.xoffset)/sparams.pixelSize);
        var y = Math.floor((rely - sparams.yoffset)/sparams.pixelSize);

        // if click was outside pixel region do nothing
        if(x > that.dim.width || x < 0 || y > that.dim.height || y < 0)
          return;

        
        // if performing an operation that does not affect the canvas
        if (that.action === "get") {
          var element = _.find(that.elements, function (e) {
            return e.x === x && e.y === y;
          }) || that.defaultElement;
          that.setCurrentElement(element);
        }
        else {

          // initialize changeset if one does not already exist
          that.currentChange = that.currentChange || {
            action: that.action, elements: []
          };

          // if element is already included in changeset, do nothing
          var matchingElement = _.find(that.currentChange.elements,
            function (e) {
              return e.x === x && e.y === y;
            }
          );

          if(that.action === "set" || that.action === "clear"){
            if (matchingElement) return;
            var newElement = _.extend(_.clone(that.currentElement),
                                      { x: x, y: y });
            that.currentChange.elements.push(newElement);
            that.paint();
          }
          else if(that.action === "fill") {
            if (matchingElement) return;
            var elements = fillArea(that.elements, { x: x, y: y }, that.dim,
                                    that.currentElement);
            that.currentChange.elements =
              that.currentChange.elements.concat(elements);
            that.paint();
          }
        }

        that.mouseMoveAction(e);
      });
    };


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
    ModelBuilder.prototype.commitChange = function (change) {
      if (!change) {
        change = this.currentChange;
        this.currentChange = null;
      }

      this.elements = applyChanges([change], this.elements, this.dim);
      this.redoStack = [];
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

      return JSON.stringify(model);
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
      var model = JSON.parse(modelJSON);

      // handle all previous versions of models
      if (model.backgroundColor) {
        this.setDefaultElement({ color: model.backgroundColor });
      }
      if (model.defaultElement) {
        this.setDefaultElement(model.defaultElement);
      }
      if (model.currentColor) {
        this.setCurrentElement({ color: model.currentColor });
      }
      if (model.currentElement) {
        this.setCurrentElement(model.currentElement);
      }
      if (model.dimensions) {
        this.resize(model.dimensions.width, model.dimensions.height);
      }
      if (model.pixels && !model.elements) model.elements = model.pixels;

      this.commitChange({ action: "import", elements: model.elements });

      this.paint();
    };


    // paint writes all stored pixels to the PixelCanvas and calls the
    // PixelCanvas" paint method
    ModelBuilder.prototype.paint = function () {
      var context = this.$htmlCanvas[0].getContext("2d");
      var i = 0;
      var elements;
      var sparams = this.pCanvas.screenParams(this.dim.width,
                                              this.dim.height);

      if (this.currentChange) {
        elements = applyChanges([this.currentChange], this.elements, this.dim);
      }
      else elements = this.elements;

      _.each(elements, function(e) {
        if(e.x >= 0 && e.x < this.dim.width && e.y >= 0 &&
           e.y < this.dim.height){
          this.pCanvas.setPixel(e.x, e.y, e.color);
        }
      }, this);

      this.pCanvas.clear();
      this.pCanvas.paint();

      if(!this.showGrid) return;

      // draw grid system after pixels have been painted, for visibility
      context.beginPath();

      for( ; i<=this.dim.width; i++){
        context.moveTo(sparams.xoffset + i*sparams.pixelSize,
                       sparams.yoffset);
        context.lineTo(sparams.xoffset + i*sparams.pixelSize,
                       sparams.yoffset + this.dim.height*sparams.pixelSize);
      }

      for(i=0 ; i<=this.dim.height; i++){
        context.moveTo(sparams.xoffset,
                       sparams.yoffset + i*sparams.pixelSize);
        context.lineTo(sparams.xoffset + this.dim.width*sparams.pixelSize,
                       sparams.yoffset + i*sparams.pixelSize);
      }

      context.closePath();
      context.strokeStyle = "#777777";
      context.stroke();
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


    // redo reapplys a change removed by an undo command if such a change
    // exists
    ModelBuilder.prototype.redo = function () {
      if (this.redoStack.length === 0) return;
      var change = this.redoStack.pop();
      this.elements = applyChanges([change], this.elements, this.dim);
      this.commitChange(change);
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
      this.pCanvas = new PixelCanvas(this.dim, this.canvasID,
                                     this.defaultElement.color);

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
      this.defaultElement = _.omit(element, 'x', 'y');
      this.pCanvas = new PixelCanvas(this.dim, this.canvasID,
                                     element.color);
      this.paint();
    };


    // setCurrentElement sets the element to be used for upcoming changes
    // made to the model.
    //
    // Arguments:
    //   element: an object with at least 'color' field
    ModelBuilder.prototype.setCurrentElement = function (element) {
      this.currentElement = _.omit(element, 'x', 'y');
    };


    // toggleGrid toggles whether to display the grid of pixel boundrys or not
    ModelBuilder.prototype.toggleGrid = function () {
      this.showGrid = !this.showGrid;
      this.pCanvas.clear();
      this.paint();
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
