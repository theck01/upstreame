define(['underscore', 'core/controller/eventhub', 'core/util/frame',
        'core/world/collisionframe'],
  function (_, EventHub, Frame, CollisionFrame) {

    // ActionBox is a moveable boundry within the game world, 
    // within the viewports bounds to the encapsulated canvas
    //
    // Argument object with fields:
    //   dimensions: object with 'width' and 'height' fields
    //   origin: object with 'x' and 'y' fields
    var ActionBox = function (opts) {
      Frame.call(this, opts.dimensions, opts.origin);
      this.cFrame = new CollisionFrame(opts.dimensions);
    };
    ActionBox.prototype = Object.create(Frame.prototype);
    ActionBox.prototype.constructor = ActionBox;


    // collisions finds all collisions of elements within the action box
    // bounds and initiates element specific collision handling routines
    ActionBox.prototype.collisions = function () {
      this.cFrame.clear();
      EventHub.trigger('actionbox.collisions', { actionbox: this });
      this.cFrame.resolve();
    };

    
    // set an element within the action box to find collisions within action box
    //
    // Arguments: 
    //   element: element to set within the actionbox
    ActionBox.prototype.set = function (element) {
      var origin = this.getOrigin();
      var pixels = element.pixels();
      _.each(pixels, function (p) {
        this.cFrame.set(element, { x: p.x - origin.x,
                                   y: p.y - origin.y });
      }, this);
    };


    return ActionBox;
  }
);
