define(['underscore', 'core/graphics/layeredcanvas', 'core/util/eventhub'],
  function (_, LayeredCanvas, EventHub) {

    // Viewport is a moveable window into the game world, drawing only sprites
    // within the viewports bounds to the encapsulated canvas
    //
    // Arguments:
    //   dimension: object with 'width' and 'height' fields
    //   origin: object with 'x' and 'y' fields
    //   canvasID: the canvas that the viewport is attached to
    //   backgroundColor:
    var Viewport = function (dimensions, origin, canvasID, backgroundColor) {
      this.dim = _.clone(dimensions);
      this.origin = _.clone(origin);
      this.canvas = new LayeredCanvas(dimensions, canvasID, backgroundColor);
    };


    // contains checks to see whether an actor is contained within a viewport
    // 
    // Arguments:
    //   actor: any actor instance
    Viewport.prototype.contains = function (actor) {
      return _.find(actor.pixels(), function (p) {
        var x = p.x - this.origin.x;
        var y = p.y - this.origin.y;
        return (x >= 0 && x < this.dim.width && y >=0 && y < this.dim.height);
      }, this);
    };


    // paint forwards to encapsulated canvas, drawing contents of viewport on
    // the screen
    Viewport.prototype.paint = function () {
      this.canvas.paint();
    };


    // render paints any part of the actor's sprite visible within the viewport
    // onto the canvas
    // 
    // Arguments:
    //   actor: Optional, any actor instance. If supplied renders that actor
    //          to the viewport. If not supplied renders entire viewport
    Viewport.prototype.render = function (actor) {
      if (!actor) {
        EventHub.trigger('viewport.render', { viewport: this });
        return;
      }

      var pixels = actor.pixels();
      _.each(pixels, function (p) {
        this.canvas.setPixel(p.x - this.origin.x, p.y - this.origin.y,
                             p.color, actor.layer());
      }, this);
    };


    // renderBackground paints any part of the actor's sprite visible within the
    // viewport onto the canvas without any offset
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
