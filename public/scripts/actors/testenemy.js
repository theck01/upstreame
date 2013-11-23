define(['actors/base', 'actors/projectile'], function (Base, Projectile) {

  // CONTANTS
  var SPEED = 2;
  var DIAGONAL_SPEED = SPEED/Math.sqrt(2);
  var FIRE_CHANCE = 0.25;


  // TestEnemy actor, performs simplistic actions with no situational awareness
  //
  // Arguments:
  //   opts: object with the following required fields
  //     group: String group name of the object ['Enemy', 'Player', etc]
  //     archive: Instance of Sprite representing visual object
  //     center: Center of the object, essentially location in the world
  //     layer: Layer that it occupies in a LayeredCanvas heirarchy
  //     noncollidables: Array of strings describing groups with which the new
  //                     instance cannot collide
  //     frameClock: FrameClock object
  //     bounds: Object with four fields: 'topmost', 'bottommost', 'leftmost',
  //             'rightmost' representing the area in which the actor may move
  var TestEnemy = function (opts) {
    opts.sprite = opts.archive.get('lizard-ship');
    Base.call(this, opts);

    this.archive = opts.archive;
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
  TestEnemy.prototype = Object.create(Base.prototype);
  TestEnemy.prototype.constructor = TestEnemy;


  // overloaded Base.act function
  TestEnemy.prototype.act = function () {
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


  // overloaded Base.collision function
  TestEnemy.prototype.collision = function () {
    this.destroy();
  };


  // overloaded Base.destroy function
  TestEnemy.prototype.destroy = function () {
    if (this.behaviorID) this.frameClock.cancel(this.behaviorID);
    if (this.fireID) this.frameClock.cancel(this.fireID);
    Base.prototype.destroy.call(this);
  };


  TestEnemy.prototype.fire = function () {
    var enemy = this;
    enemy.sprite = enemy.archive.get('lizard-ship-prefire');

    enemy.fireID = enemy.frameClock.schedule(function () {

      enemy.sprite = enemy.archive.get('lizard-ship-firing');
      new Projectile({
        group: enemy.group,
        sprite: enemy.archive.get('enemy-ship-laser'),
        center: enemy.center,
        layer: enemy.layer,
        noncollidables: [enemy.group],
        path: function () {
          return { x: this.center.x, y: this.center.y + SPEED*2 };
        }
      });

      enemy.fireID = enemy.frameClock.schedule(function () {

        enemy.sprite = enemy.archive.get('lizard-ship-prefire');

        enemy.fireID = enemy.frameClock.schedule(function () {

          enemy.sprite = enemy.archive.get('lizard-ship');
          enemy.fireID = undefined;
        }, 10);
      }, 5);
    }, 10);
  };

  return TestEnemy;
});
