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
    //   integer values, or a hexadecimal string "#RRGGBB"
    //
    // Returns:
    //   A color string in the form "#RRGGBB"
    Color.hex = function (color) {
      var colorString = "#";
      var sanitizedColor = sanitize(color);

      if(typeof sanitizedColor === "object"){
        colorString += hexString(sanitizedColor.red);
        colorString += hexString(sanitizedColor.green);
        colorString += hexString(sanitizedColor.blue);
      }
      else colorString = sanitizedColor;

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
    //   color: Either an object intended to have fields for red, green, and
    //          blue with 8 bit integer values or a hexadecimal string in the
    //          format #RRGGBB
    //
    // Returns:
    //   Either color tuple with only fields for red, green, and blue with 8 bit
    //   integer values, or a hexadecimal string in the format #RRGGBB, where
    //   the output type matches the input type. If neither of the appropriate
    //   types are provided as an argument then #FFFFFF is returned
    function sanitize(color) {
      var sanitizedColor = null;
      var colorTuple = null;

      if(typeof color === "object"){
        sanitizedColor = {};
        colorTuple = _.extend({}, color);
        colorTuple = _.defaults(colorTuple, { red: 0, blue: 0, green: 0 });
        colorTuple = _.pick(colorTuple, ["red", "green", "blue"]);
        _.each(colorTuple, function(v,k) {
          sanitizedColor[k] = Math.min(Math.max(v,0), 255);
        });
      }
      else if(typeof color === "string"){
        if(color[0] !== "#"){
          color = "#" + color;
        }

        // check for format "#RRGGBB" and "#RGB"
        if(color.match(/^#[A-Fa-f0-9]{6}$/g)) sanitizedColor = color;
        else if(color.match(/^#[A-Fa-f0-9]{3}$/g)){
          sanitizedColor = "#" + color[1] + color[1] + color[2] + color[2];
          sanitizedColor += color[3] + color[3];
        }
        else sanitizedColor = "#FFFFFF";
      }
      else sanitizedColor = "#FFFFFF";

      return sanitizedColor;
    }


    // tuple takes a color in the format "#RRGGBB" and generates a tuple
    // with red, green, and blue fields
    //
    // Arguments:
    //   color: Either an object intended to have fields for red, green, and
    //          blue with 8 bit integer values or a hexadecimal string in the
    //          format #RRGGBB
    //
    // Returns:
    //   A color tuple with only fields for red, green, and blue with 8 bit
    //   integer values
    Color.tuple = function (color) {
      var colorTuple = {};
      var sanitizedColor = {};
      
      sanitizedColor = sanitize(color);

      if(typeof color === "string"){
        colorTuple.red = parseInt(sanitizedColor.substring(1,3),16);
        colorTuple.green = parseInt(sanitizedColor.substring(3,5),16);
        colorTuple.blue = parseInt(sanitizedColor.substring(5,7),16);
      }
      else colorTuple = sanitizedColor;

      return colorTuple;
    };

    return Color;
  }
);
