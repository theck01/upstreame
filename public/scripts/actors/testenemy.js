define(['actors/base'], function (Base) {

  // CONTANTS
  var SPEED = 2;
  var DIAGONAL_SPEED = SPEED/Math.sqrt(2);


  // TestEnemy actor, performs simplistic actions with no situational awareness
  //
  // Arguments:
  //   frameClock: FrameClock object
  //   archive: SpriteArchive object
  //   center: center of the actor's sprite
  //   layer: layer to draw the actor's sprite
  //   bounds: Object with four fields: 'topmost', 'bottommost', 'leftmost',
  //           'rightmost' representing the area in which the actor may move
  var TestEnemy = function (group, archive, center, layer, bounds, frameClock) {
    Base.call(this, group, archive.get('lizard-ship'), center, layer,
              [group]);

    this.archive = archive;
    this.bounds = bounds;
    this.velocity = { x: 0, y: 0 };

    var enemy = this;
    frameClock.recurring(function () {
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


  return TestEnemy;
});
