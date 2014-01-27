define(['core/graphics/viewport', 'core/util/eventhub'],
  function (Viewport, EventHub) {


    // distance returns the distance between two points
    //
    // Arguments:
    //   p: object with 'x' and 'y' fields
    //   q: object with 'x' and 'y' fields
    // Returns a scalar distance
    function distance (p, q) {
      return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
    }


    // unitize returns the unit vector pointing the the same direction as v
    //
    // Arguments:
    //   v: object with 'x' and 'y' fields
    // Returns an object with 'x' and 'y' fields
    function unitize (v) {
      var magnitude = distance(v, { x: 0, y: 0 });
      return { x: v.x/magnitude, y: v.y/magnitude };
    }


    // FollowingViewport is a Viewport that follows an actor, shifting view to
    // keep actor within some bound in the viewport
    //
    // Argument object with fields
    //   dimension: object with 'width' and 'height' fields
    //   origin: object with 'x' and 'y' fields
    //   canvasID: the canvas that the viewport is attached to
    //   backgroundColor: color string
    //   actor: actor to follow
    //   followRadius: Maximum distance from the center of the viewport and the
    //                 actor
    var FollowingViewport = function (opts) {
      Viewport.call(this, opts);
      this.followRadius = opts.followRadius;
      this.follow(opts.actor);

      var fview = this;

      EventHub.subscribe('actor.destroy', function (params) {
        if (fview.actor && params.actor.id() === fview.actor.id()) {
          fview.actor = null;
        }
      });
    };
    FollowingViewport.prototype = Object.create(Viewport.prototype);
    FollowingViewport.prototype.constructor = FollowingViewport;


    // render extended to shift viewport if actor leaves bounds
    FollowingViewport.prototype.render = function (actor) {

      // if rendering scene and following an existing actor, ensure actor is
      // within follow radius or shift viewport to make sure
      if (!actor && this.actor) {
        var actorPos = this.actor.position();
        var center = { x: Math.floor(this.origin.x + this.dim.width/2),
                       y: Math.floor(this.origin.y + this.dim.height/2) };
        var distDiff = distance(center, actorPos) - this.followRadius;
        var unitDiff = unitize({ x: actorPos.x - center.x,
                                 y: actorPos.y - center.y });

        if (distDiff > 0) {
          this.origin.x = Math.floor(this.origin.x + distDiff * unitDiff.x);
          this.origin.y = Math.floor(this.origin.y + distDiff * unitDiff.y);
        }
      }

      Viewport.prototype.render.call(this, actor);
    };

    
    // follow sets actor to follow
    //
    // Arguments:
    //   actor: actor to follow
    FollowingViewport.prototype.follow = function (actor) {
      this.actor = actor;
    };

    return FollowingViewport;
  }
);
