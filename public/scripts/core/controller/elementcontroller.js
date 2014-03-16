define([], function () {

  var ElementController = Object.create(null);


  // clear removes all elements from the controller
  ElementController.clear = function () {
    ElementController._elements = Object.create(null);
    ElementController._elements.byName = Object.create(null);
    ElementController._elements.byType = Object.create(null);
  };


  // Initialize the controller
  ElementController.clear();


  // create returns the element specified by the model object
  //
  // Arguments:
  //   model: Raw model object used to create element
  ElementController.create = function (name, model) {
    var element = ElementController._elements.byName[name];
    return !!element ? element.constructor(model) : null;
  };


  // getByType returns the names of all menus of a given type
  //
  // Arguments:
  //   elementType: string such as 'background' or 'actor'
  // Returns an array of element names with that type
  ElementController.getByType = function (elementType) {
    return ElementController._elements.byType[elementType] || [];
  };


  // getMenu returns the unrendered object menu for the element with given
  // name
  //
  // Arguments:
  //   name: name of the menu to render
  // Returns:
  //   object with keys equaling field names of parameters in element
  //   constructors and values equaling default values to fill menu.
  //   values may be numbers, strings, or objects containing numbers
  //   strings and/or objects...
  ElementController.getMenu = function (name) {
    var element = ElementController._elements.byName[name];
    return !!element ? element.menu : undefined;
  };


  // register an element in the ElementController
  //
  // Arguments:
  //   name: String name of the element
  //   elementType: String name of type of the element ('background',
  //                'actor', etc.)
  //   constructor: Function used to create the element from a model object
  //   menu: object with keys equaling field names of parameters in element
  //         constructors and values equaling default values to fill menu.
  //         Values may be numbers, strings, or objects containing numbers
  //         strings and/or objects...
  ElementController.register = function (name, elementType, constructor,
                                         menu) {
    ElementController._elements.byName[name] = { constructor: constructor,
                                                menu: menu,
                                                elementType: elementType };
    ElementController._elements.byType[elementType] =
                          ElementController._elements.byType[elementType] || [];
    ElementController._elements.byType[elementType].push(name);
  };


  return ElementController;
});
