define(['underscore', 'core/graphics/layeredcanvas', 'core/util/eventhub'],
  function (_, LayeredCanvas, EventHub) {

    // Viewport is a moveable window into the game world, drawing only sprites
    // within the viewports bounds to the encapsulated canvas
    //
    // Argument object with fields:
    //   dimensions: object with 'width' and 'height' fields
    //   origin: object with 'x' and 'y' fields
    //   canvasID: the canvas that the viewport is attached to
    //   backgroundColor: CSS color string
    var Viewport = function (opts) {
      this.dim = _.clone(opts.dimensions);
      this.origin = _.clone(opts.origin);
      this.canvas = new LayeredCanvas(opts.dimensions, opts.canvasID,
                                      opts.backgroundColor);
    };


    // bounds returns the bounds of the viewport's visible field
    //
    // Returns an object with 'xmin', 'xmax', 'ymin', 'ymax' fields
    Viewport.prototype.bounds = function () {
      return { xmin: this.origin.x, ymin: this.origin.y,
               xmax: this.origin.x + this.dim.width,
               ymax: this.origin.y + this.dim.height };
    };


    // contains checks to see whether an element is contained within a viewport
    // 
    // Arguments:
    //   element: any element instance
    Viewport.prototype.contains = function (element) {
      return _.find(element.pixels(), function (p) {
        var x = p.x - this.origin.x;
        var y = p.y - this.origin.y;
        return (x >= 0 && x < this.dim.width && y >=0 && y < this.dim.height);
      }, this);
    };




    // render paints the full scene onto the pixel canvas or any part of the
    // scene visible within the viewport onto the canvas
    // 
    // Arguments:
    //   element: Optional, any instance that supplies a pixels and layer 
    //            method. If supplied renders that element to the viewport.
    //            If not supplied renders entire viewport
    Viewport.prototype.render = function (element) {
      if (!element) {
        EventHub.trigger('viewport.render', { viewport: this });
        this.canvas.paint();
        return;
      }

      var pixels = element.pixels();
      _.each(pixels, function (p) {
        this.canvas.setPixel(p.x - this.origin.x, p.y - this.origin.y,
                             p.color, element.layer());
      }, this);
    };


    // renderBackground paints an element onto the viewport without any offset
    // 
    // Arguments:
    //   background: any object that has a paintOn method
    Viewport.prototype.renderBackground = function (background) {
      var pixels = background.pixels();
      _.each(pixels, function (p) {
        this.canvas.setPixel(p.x, p.y, p.color, background.layer());
      }, this);
    };

    return Viewport;
  }
);
