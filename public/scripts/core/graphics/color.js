define([], function () {

  // Color object contains a set of functions for dealing with color tuples
  // (objects with red, green, and blue fields)
  var Color = {};

  // sanitize takes a color hexadecimal string and returns a properly formatted
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
    if(color.match(/^#[A-Fa-f0-9]{6}$/g)) return color.toUpperCase();
    else if(color.match(/^#[A-Fa-f0-9]{3}$/g)){
      sanitizedColor = "#" + color[1] + color[1] + color[2] + color[2];
      sanitizedColor += color[3] + color[3];
      return sanitizedColor.toUpperCase();
    }

    return "#FFFFFF";
  };


  // shade a single component of a hexadecimal color
  //
  // Arguments:
  //   color: A two digit hexadecimal string
  //   change: An integer value to offset each RGB field by. Negative changes
  //           darken colors, positive changes brighten them
  //
  // Returns: A two digit hexadecimal string
  function shadeComponent (comp, change) {
    comp = parseInt(comp, 16) + change;
    comp = Math.max(Math.min(comp, 255), 0).toString(16);
    return ("0" + comp).slice(-2);
  }
  
  // shade brightens or darkens a hexadecimal color string
  //
  // Arguments:
  //   color: A hexidecimal color string in the form "#RRGGBB"
  //   change: An integer value to offset each RGB field by. Negative changes
  //           darken colors, positive changes brighten them
  //
  // Returns: A hexidecimal color string in the form "#RRGGBB"
  Color.shade = function (color, change) {
    color = Color.sanitize(color);

    var red = color.substr(1,2);
    var green = color.substr(3,2);
    var blue = color.substr(5,2);

    var shadedColor = "#";
    shadedColor += shadeComponent(red, change);
    shadedColor += shadeComponent(green, change);
    shadedColor += shadeComponent(blue, change);

    return Color.sanitize(shadedColor);
  };

  return Color;
});
