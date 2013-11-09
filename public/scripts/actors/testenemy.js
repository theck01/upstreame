define(['actors/base'], function (Base) {

  // CONTANTS
  var SPEED = 2;
  var DIAGONAL_SPEED = SPEED/Math.sqrt(2);


  // TestEnemy actor, performs simplistic actions with no situational awareness
  //
  // Arguments:
  //   archive: SpriteArchive object
  //   center: center of the actor's sprite
  //   layer: layer to draw the actor's sprite
  //   bounds: Object with four fields: 'topmost', 'bottommost', 'leftmost',
  //           'rightmost' representing the area in which the actor may move
  var TestEnemy = function (archive, center, layer, bounds) {
    Base.call(this, 'TestEnemy', archive.get('lizard-ship'), center, layer,
              ['TestEnemy']);
    this.archive = archive;
    this.bounds = bounds;
  };
  TestEnemy.prototype = Object.create(Base.prototype);
  TestEnemy.prototype.constructor = TestEnemy;

  // overloaded Base.act function
  TestEnemy.prototype.act = function () {
    // randomly select direction in which to move
    var verticalChange = Math.floor(Math.random() * 3) - 1;
    var horizontalChange = Math.floor(Math.random() * 3) - 1;
  
    // update sprite location
    if (horizontalChange && verticalChange) {
      this.center.x += DIAGONAL_SPEED * horizontalChange;
      this.center.y += DIAGONAL_SPEED * verticalChange;
    }
    else if (horizontalChange) {
      this.center.x += SPEED * horizontalChange;
    }
    else {
      this.center.y += SPEED * verticalChange;
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
