define(['underscore', 'core/graphics/spritearchive', 'core/actors/base',
        'invaders/actors/projectile'],
  function (_, SpriteArchive, Base, Projectile) {

    // CONTANTS
    var SPEED = 2;
    var DIAGONAL_SPEED = SPEED/Math.sqrt(2);
    var FIRE_CHANCE = 0.25;


    // Grunt actor, performs simplistic actions with no situational
    // awareness
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: String group name of the object ['Enemy', 'Player', etc]
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    //     frameClock: FrameClock object
    //     bounds: Object with four fields: 'topmost', 'bottommost', 'leftmost',
    //             'rightmost' representing the area in which the actor may move
    var Grunt = function (opts) {
      opts.sprite = SpriteArchive.get('lizard-ship');
      Base.call(this, opts);

      this.bounds = opts.bounds;
      this.velocity = { x: 0, y: 0 };
      this.frameClock = opts.frameClock;
      this.fireID = undefined;

      var enemy = this;
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
    Grunt.prototype = Object.create(Base.prototype);
    Grunt.prototype.constructor = Grunt;


    // overloaded Base.act function
    Grunt.prototype.act = function () {
      var abs = _.pick(this.center, 'x', 'y');

      // update sprite location
      if (this.velocity.x && this.velocity.y) {
        abs.x += DIAGONAL_SPEED * this.velocity.x;
        abs.y += DIAGONAL_SPEED * this.velocity.y;
      }
      else if (this.velocity.x) {
        abs.x += SPEED * this.velocity.x;
      }
      else {
        abs.y += SPEED * this.velocity.y;
      }

      // update sprite location to stay within bounds
      if (abs.x < this.bounds.leftmost) {
        abs.x = this.bounds.leftmost;
      }
      if (abs.x > this.bounds.rightmost) {
        abs.x = this.bounds.rightmost;
      }
      if (abs.y < this.bounds.topmost) {
        abs.y = this.bounds.topmost;
      }
      if (abs.y > this.bounds.bottommost) {
        abs.y = this.bounds.bottommost;
      }

      this.move(abs, 'absolute');
    };


    // overloaded Base.collision function
    Grunt.prototype.collision = function () {
      this.destroy();
    };


    // overloaded Base.destroy function
    Grunt.prototype.destroy = function () {
      if (this.behaviorID) this.frameClock.cancel(this.behaviorID);
      if (this.fireID) this.frameClock.cancel(this.fireID);
      Base.prototype.destroy.call(this);
    };


    // fire initiates the creation of projectiles and the firing animation
    Grunt.prototype.fire = function () {
      var enemy = this;
      enemy.sprite = SpriteArchive.get('lizard-ship-prefire');

      enemy.fireID = enemy.frameClock.schedule(function () {

        enemy.sprite = SpriteArchive.get('lizard-ship-firing');
        new Projectile({
          group: enemy.group,
          sprite: SpriteArchive.get('enemy-ship-laser'),
          center: enemy.center,
          layer: enemy.layer(),
          noncollidables: [enemy.group],
          path: function () {
            return { x: this.center.x, y: this.center.y + SPEED*2 };
          }
        });

        enemy.fireID = enemy.frameClock.schedule(function () {

          enemy.sprite = SpriteArchive.get('lizard-ship-prefire');

          enemy.fireID = enemy.frameClock.schedule(function () {

            enemy.sprite = SpriteArchive.get('lizard-ship');
            enemy.fireID = undefined;
          }, 10);
        }, 5);
      }, 10);
    };

    return Grunt;
  }
);
