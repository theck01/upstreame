define(['underscore'], function (_) {

  // Color object contains a set of functions for dealing with color tuples
  // (objects with red, green, and blue fields)
  var Color = {};

  
  // _DEFAULT_COLOR is the default value for the improperly formatted color
  // strings to take when provided to Color functions.
  Color._DEFAULT_COLOR = '#FFFFFF';


  // _DEFAULT_COLOR_COMPONENT is the default value for unspecified or bad color
  // components in objects that should contain 'red', 'green', and 'blue'
  // fields.
  Color._DEFAULT_COLOR_COMPONENT = 255;

  // sanitize takes a color hexadecimal string and returns a properly formatted
  // color hexadecimal string
  //
  // Arguments:
  //   color: A hexidecimal color string in the form '#RRGGBB'
  //
  // Returns:
  //   A hexidecimal color string in the form '#RRGGBB', '#FFFFFF' if the
  //   color is improperly formatted
  Color.sanitize = function (color) {
    var sanitizedColor = null;

    if(color[0] !== '#'){
      color = '#' + color;
    }

    // check for format '#RRGGBB' and '#RGB'
    if(color.match(/^#[A-Fa-f0-9]{6}$/g)) return color.toUpperCase();
    else if(color.match(/^#[A-Fa-f0-9]{3}$/g)){
      sanitizedColor = '#' + color[1] + color[1] + color[2] + color[2];
      sanitizedColor += color[3] + color[3];
      return sanitizedColor.toUpperCase();
    }

    return Color._DEFAULT_COLOR;
  };
  

  // shade brightens or darkens a hexadecimal color string
  //
  // Arguments:
  //   color: A hexidecimal color string in the form '#RRGGBB'
  //   change: An integer value to offset each RGB field by. Negative changes
  //           darken colors, positive changes brighten them
  //
  // Returns: A hexidecimal color string in the form '#RRGGBB'
  Color.shade = function (color, change) {
    var colorObj = Color.toObject(color);
    
    _.each(['red', 'green', 'blue'], function (comp) {
      colorObj[comp] += change;
    });

    return Color.toString(colorObj);
  };


  // toObject converts a color hexadecimal string to an object with 'red',
  // 'green', and 'blue' fields.
  //
  // Arguments:
  //   color: A hexadecimal color string in the form '#RRGGBB'
  //   opt_skipSanitation: Optional boolean on whether to skip sanitization.
  //                       Can be set to true if colors have already been
  //                       sanitized previously. Defaults to false.
  // Returns an obje with 'red', 'green', and 'blue' fields
  Color.toObject = function (color, opt_skipSanitation) {
    var colorObj = Object.create(null);

    color = opt_skipSanitation ? color : Color.sanitize(color);
    colorObj.red = parseInt(color.substr(1,2), 16);
    colorObj.green = parseInt(color.substr(3,2), 16);
    colorObj.blue = parseInt(color.substr(5,2), 16);

    return colorObj;
  };


  // toString converts a color object with 'red', 'green', and 'blue' integer
  // fields to a hexadecimal string in the form '#RRGGBB'
  //
  // Arguments:
  //   colorObj: An object with 'red', 'green', 'blue' fields.
  // Returns a hexadecimal color string in the form '#RRGGBB'
  Color.toString = function (colorObj) {
    var color = '#';

    _.each(['red', 'green', 'blue'], function (comp) {
      var component = colorObj[comp] || Color._DEFAULT_COLOR_COMPONENT;
      var compStr = Math.max(Math.min(component, 255), 0).toString(16);
      color += ('0' + compStr).slice(-2).toUpperCase();
    });

    return color;
  };


  return Color;
});
