define(
    ['jquery', 'blog/constants', 'core/graphics/pixelcanvas',
     'core/graphics/sprite'],
    function ($, Constants, PixelCanvas, Sprite) {
  // An application for viewing blog posts in aggregate.
  var Blog = function() {
    this._$canvas = null;
    this._logoCanvas = null;
    this._logoSprite = null;
  };


  // initializes the Blog DOM, should be called once the document is ready.
  Blog.prototype.init = function (logoCanvasID) {
    this._$canvas = $(logoCanvasID);
    this._logoCanvas = new PixelCanvas(
        Constants.LOGO_CANVAS_DIMENSIONS, logoCanvasID);

    this._sizeAndPaintLogoCanvas();
    $(window).on('resize', Blog.prototype._sizeAndPaintLogoCanvas.bind(this));
  };


  // Retrieve the logo sprite from the server and paint on the screen,
  // if the document has loaded.
  Blog.prototype.retrieveLogo = function (spriteName) {
    var blog = this;
    $.ajax({
      type: 'GET',
      url: '/sprite/' + spriteName,
      dataType: 'json',
      success: function (data) {
        blog._logoSprite = new Sprite(data.pixels);
        if (blog._logoCanvas) blog._sizeAndPaintLogoCanvas();
      }
    });
  };


  // Resize size the canvas to fill the parent container and paint the logo on
  // the canvas, if the logo has been loaded.
  Blog.prototype._sizeAndPaintLogoCanvas = function () {
    var $canvasParent = $(this._$canvas.parent());
    if (this._$canvas[0].width !== $canvasParent.width() ||
        this._$canvas[0].height !== $canvasParent.height()){
      this._$canvas[0].width = $canvasParent.width();
      this._$canvas[0].height = $canvasParent.height();
    }

    if (this._logoSprite) {
      this._logoSprite.paintOn(this._logoCanvas, Constants.LOGO_CANVAS_OFFSET);
    }
    this._logoCanvas.paint();
  };


  return Blog;
});
