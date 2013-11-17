define([], function () {

  // Color object contains a set of functions for dealing with color tuples
  // (objects with red, green, and blue fields)
  var Color = {};

  // sanitize takes a color hexadecimal string and returns a properly
  // color hexadecimal string
  //
  // Arguments:
  //   color: A hexidecimal color string in the form "#RRGGBB"
  //
  // Returns:
  //   A hexidecimal color string in the form "#RRGGBB", "#FFFFFF" if the
  //   color is improperly formatted
  Color.sanitize = function (color) {
    var sanitizedColor = null;

    if(color[0] !== "#"){
      color = "#" + color;
    }

    // check for format "#RRGGBB" and "#RGB"
    if(color.match(/^#[A-Fa-f0-9]{6}$/g)) return color;
    else if(color.match(/^#[A-Fa-f0-9]{3}$/g)){
      sanitizedColor = "#" + color[1] + color[1] + color[2] + color[2];
      sanitizedColor += color[3] + color[3];
      return sanitizedColor;
    }

    return "#FFFFFF";
  };

  return Color;
});
