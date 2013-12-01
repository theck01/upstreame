define(['core/graphics/spritearchive', 'invaders/actors/baseinvader'],
  function (SpriteArchive, BaseInvader) {

    // Constants
    var ANIMATION_FRAME_RATE = 2; // frames per sprite
    var ANIMATION_CELLS = 8;

    // EnergyEnemy actor
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: Group that the EnergyEnemy will belong to
    //     center: center of the actor's sprite
    //     layer: layer to draw the actor's sprite
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    //     frameClock: FrameClock object
    var EnergyEnemy = function (opts) {
      opts.sprite = SpriteArchive.get('energy-ship-big1');
      BaseInvader.call(this, opts);

      this.frameClock = opts.frameClock;

      var enemy = this;
      var frame = 0;
      this.animationID = this.frameClock.recurring(function () {
        var spriteName = 'energy-ship-big';
        spriteName += (Math.floor(frame/ANIMATION_FRAME_RATE) + 1).toString();
        frame = (frame + 1) % (ANIMATION_FRAME_RATE * ANIMATION_CELLS);
        enemy.sprite = SpriteArchive.get(spriteName);
      }, ANIMATION_FRAME_RATE);
    };
    EnergyEnemy.prototype = Object.create(BaseInvader.prototype);
    EnergyEnemy.prototype.constructor = EnergyEnemy;


    // overloaded BaseInvader.act function
    EnergyEnemy.prototype.act = function () {};

    
    // overloaded collision function
    EnergyEnemy.prototype.collision = function () {
      this.destroy();
    };


    // overload destroy function
    EnergyEnemy.prototype.destroy = function () {
      this.frameClock.cancel(this.animationID);
      BaseInvader.prototype.destroy.call(this);
    };


    return EnergyEnemy;
  }
);
