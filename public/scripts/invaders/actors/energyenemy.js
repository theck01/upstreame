define(['core/graphics/spritearchive', 'invaders/actors/baseinvader',
        'invaders/actors/projectile'],
  function (SpriteArchive, BaseInvader, Projectile) {

    // Constants
    var ANIMATION_FRAME_RATE = 2; // frames per sprite
    var ANIMATION_CELLS = 8;
    var SPEED = 1;
    var DIAGONAL_SPEED = SPEED/Math.sqrt(2);
    var FIRE_CHANCE = 0.5;

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
    //   optional fields for the opts param:
    //     onDestroy: extra cleanup that takes place when the actor is destroyed
    var EnergyEnemy = function (opts) {
      opts.sprite = SpriteArchive.get('energy-ship-big1');
      BaseInvader.call(this, opts);

      this.bounds = opts.bounds;
      this.frameClock = opts.frameClock;
      this.velocity = { x: 0, y: 0 };

      var frame = 0;
      var enemy = this;
      this.animationID = this.frameClock.recurring(function () {
        var spriteName = 'energy-ship-big';
        spriteName += (Math.floor(frame/ANIMATION_FRAME_RATE) + 1).toString();
        frame = (frame + 1) % (ANIMATION_FRAME_RATE * ANIMATION_CELLS);
        enemy.sprite = SpriteArchive.get(spriteName);
      }, ANIMATION_FRAME_RATE);

      this.behaviorID = enemy.frameClock.recurring(function () {
        // randomly select direction in which to move
        if (Math.random() < FIRE_CHANCE) {
          enemy.velocity.x = 0;
          enemy.velocity.y = 0;
          enemy.fire();
        }
        else {
          enemy.velocity.x = Math.floor(Math.random() * 3) - 1;
          enemy.velocity.y = Math.floor(Math.random() * 3) - 1;
        }
      }, 30);
    };
    EnergyEnemy.prototype = Object.create(BaseInvader.prototype);
    EnergyEnemy.prototype.constructor = EnergyEnemy;


    // overloaded BaseInvader.act function
    EnergyEnemy.prototype.act = function () {
      // update sprite location
      if (this.velocity.x && this.velocity.y) {
        this.center.x += DIAGONAL_SPEED * this.velocity.x;
        this.center.y += DIAGONAL_SPEED * this.velocity.y;
      }
      else if (this.velocity.x) {
        this.center.x += SPEED * this.velocity.x;
      }
      else {
        this.center.y += SPEED * this.velocity.y;
      }

      // update sprite location to stay within bounds
      if (this.center.x < this.bounds.leftmost) {
        this.center.x = this.bounds.leftmost;
      }
      if (this.center.x > this.bounds.rightmost) {
        this.center.x = this.bounds.rightmost;
      }
      if (this.center.y < this.bounds.topmost) {
        this.center.y = this.bounds.topmost;
      }
      if (this.center.y > this.bounds.bottommost) {
        this.center.y = this.bounds.bottommost;
      }
    };

    
    // overloaded collision function
    EnergyEnemy.prototype.collision = function () {
      this.destroy();
    };


    // overload destroy function
    EnergyEnemy.prototype.destroy = function () {
      this.frameClock.cancel(this.animationID);
      this.frameClock.cancel(this.behaviorID);
      BaseInvader.prototype.destroy.call(this);
    };


    // fire initiates the creation of projectiles and the firing animation
    EnergyEnemy.prototype.fire = function () {
      new Projectile({
        group: this.group,
        sprite: SpriteArchive.get('enemy-ship-laser'),
        center: { x: this.center.x, y: this.center.y + 10 },
        layer: this.layer,
        noncollidables: [this.group],
        path: function () {
          return { x: this.center.x, y: this.center.y + SPEED*3 };
        }
      });

      new Projectile({
        group: this.group,
        sprite: SpriteArchive.get('enemy-ship-laser'),
        center: { x: this.center.x + 5, y: this.center.y + 10 },
        layer: this.layer,
        noncollidables: [this.group],
        path: function () {
          return { x: this.center.x + SPEED, y: this.center.y + SPEED*2 };
        }
      });

      new Projectile({
        group: this.group,
        sprite: SpriteArchive.get('enemy-ship-laser'),
        center: { x: this.center.x - 5, y: this.center.y + 10 },
        layer: this.layer,
        noncollidables: [this.group],
        path: function () {
          return { x: this.center.x - SPEED, y: this.center.y + SPEED*2 };
        }
      });
    };


    return EnergyEnemy;
  }
);
