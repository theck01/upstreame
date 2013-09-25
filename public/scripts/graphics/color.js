define(["underscore"],
  function (_) {

    // Color object contains a set of functions for dealing with color tuples
    // (objects with red, green, and blue fields)
    var Color = {};

    // hex takes a color in the form of a tuple with red, green, and blue 
    // fields and returns a string in the form "#RRGGBB"
    //
    // Arguments:
    //   A color tuple with fields for red, green, and blue with 8 bit
    //   integer values
    //
    // Returns:
    //   A color string in the form "#RRGGBB"
    Color.hex = function (colorTuple) {
      var colorString = "#";
      var sanitizedColor = Color.sanitize(colorTuple);

      colorString += hexString(sanitizedColor.red);
      colorString += hexString(sanitizedColor.green);
      colorString += hexString(sanitizedColor.blue);
      return colorString;
    };


    // hexString takes an 8 bit number and converts it into a two character
    // hexadecimal string
    //
    // Argument:
    //   eightBit: An integer in range 0-255
    //
    // Returns:
    //   A two character hexadecimal string
    function hexString(eightBit){
      var str = eightBit.toString(16);
      if(str.length === 1){
        return "0" + str;
      }
      else return str;
    }


    // sanitize takes a color tuple and returns a tuple containing only fields
    // for red, green, and blue with values from 0 to 255
    //
    // Arguments:
    //   colorTuple: An object intended to have fields for red, green, and
    //               blue with 8 bit integer values
    //
    // Returns:
    //   A color tuple with only fields for red, green, and blue with 8 bit
    //   integer values
    Color.sanitize = function (colorTuple) {
      var sanitizedColor = {};
      var color = {};

      _.extend(color, colorTuple);
      _.defaults(color, { red: 0, blue: 0, green: 0 });
      color = _.pick(color, ["red", "green", "blue"]);
      _.each(color, function(v,k) {
        sanitizedColor[k] = Math.min(Math.max(v,0), 255);
      });

      return sanitizedColor;
    };


    // tuple takes a color in the format "#RRGGBB" and generates a tuple
    // with red, green, and blue fields
    //
    // Arguments:
    //   A color string in the form "#RRGGBB"
    //
    // Returns:
    //   A color tuple with only fields for red, green, and blue with 8 bit
    //   integer values
    Color.tuple = function (colorHex) {
      var colorTuple = {};

      colorTuple.red = parseInt(colorHex.substring(1,3),16);
      colorTuple.green = parseInt(colorHex.substring(3,5),16);
      colorTuple.blue = parseInt(colorHex.substring(5,7),16);

      return colorTuple;
    };

    return Color;
  }
);
