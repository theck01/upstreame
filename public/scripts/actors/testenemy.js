define(['actors/base'], function (Base) {

  // CONTANTS
  var SPEED = 2;
  var DIAGONAL_SPEED = SPEED/Math.sqrt(2);


  // TestEnemy actor, performs simplistic actions with no situational awareness
  //
  // Arguments:
  //   opts: object with the following required fields
  //     group: String group name of the object ['Enemy', 'Player', etc]
  //     sprite: Instance of Sprite representing visual object
  //     center: Center of the object, essentially location in the world
  //     layer: Layer that it occupies in a LayeredCanvas heirarchy
  //     noncollidables: Array of strings describing groups with which the new
  //                     instance cannot collide
  //     frameClock: FrameClock object
  //     bounds: Object with four fields: 'topmost', 'bottommost', 'leftmost',
  //             'rightmost' representing the area in which the actor may move
  var TestEnemy = function (opts) {
    Base.call(this, opts);

    this.bounds = opts.bounds;
    this.velocity = { x: 0, y: 0 };

    var enemy = this;
    opts.frameClock.recurring(function () {
      // randomly select direction in which to move
      enemy.velocity.x = Math.floor(Math.random() * 3) - 1;
      enemy.velocity.y = Math.floor(Math.random() * 3) - 1;
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

  return TestEnemy;
});
