require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  },
  shim: { "bootstrap": {
      deps: ["jquery"]
    }
  }
});


require(["jquery", "interface/pixelcolorer", "bootstrap"],
  function ($, PixelColorer) {
    // persistent UI variables
    var $backgroundColorInput;
    var $backgroundColorPreview;
    var $canvas;
    var pixelArtCanvas;
    var $pixelColorInput;
    var $pixelColorPreview;
    var $pixelHeight;
    var $pixelWidth;

    // initial canvas sizing variable
    var initialSize = 16;



    function sizeCanvas() {
      $canvas[0].width = $canvas.parent().width();
      $canvas[0].height = $canvas.parent().height();
    }


    $(function () {
      $("input:radio[name=action]").change(function () {
        pixelArtCanvas.setAction($(this).val());
      });

      $canvas = $("#pixel-art-canvas");
      sizeCanvas();

      pixelArtCanvas = new PixelColorer(initialSize, initialSize,
                                        "#pixel-art-canvas");
      pixelArtCanvas.mousemove(function () {
        if($("input:radio[name=action]:checked").val() === "get"){
          $pixelColorInput.val(pixelArtCanvas.getColor());
          $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());
        }
      });
      pixelArtCanvas.paint();

      $pixelHeight = $("#pixel-height-input");
      $pixelHeight.keyup(function () {
        pixelArtCanvas.resize(parseInt($pixelWidth.val(), 10) || 1,
                              parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelHeight.val(initialSize.toString());

      $pixelWidth = $("#pixel-width-input");
      $pixelWidth.keyup(function () {
        pixelArtCanvas.resize(parseInt($pixelWidth.val(), 10) || 1,
                              parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelWidth.val(initialSize.toString());

      $pixelColorPreview = $("#pixel-color-preview");
      $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());

      $pixelColorInput = $("#pixel-color-input");
      $pixelColorInput.keyup(function () {
        pixelArtCanvas.setColor($pixelColorInput.val());
        $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());
      });
      $pixelColorInput.val(pixelArtCanvas.getColor());

      $backgroundColorPreview = $("#background-color-preview");
      $backgroundColorPreview.css("background-color",
                                  pixelArtCanvas.getBackgroundColor());

      $backgroundColorInput = $("#background-color-input");
      $backgroundColorInput.keyup(function () {
        pixelArtCanvas.setBackgroundColor($backgroundColorInput.val());
        $backgroundColorPreview.css("background-color",
                                    pixelArtCanvas.getBackgroundColor());
      });
      $backgroundColorInput.val(pixelArtCanvas.getBackgroundColor());

      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
    });
  }
);
