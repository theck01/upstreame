define(['jquery', 'underscore'], function ($, _) {

  var ElementController = Object.create(null);
  ElementController.elements = Object.create(null);
  ElementController.elements.byName = Object.create(null);
  ElementController.elements.byType = Object.create(null);


  // create returns the element specified by the model object
  //
  // Arguments:
  //   model: Raw model object used to create element
  ElementController.create = function (model) {
    var constructor = ElementController.elements.byName[model.name].constructor;
    return constructor(model);
  };


  // getByType returns the names of all menus of a given type
  //
  // Arguments:
  //   elementType: string such as 'background' or 'actor'
  ElementController.getByType = function (elementType) {
    return ElementController.elements.byType[elementType];
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
    return ElementController.elements.byName[name].menu;
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
    ElementController.elements.byName[name] = { constructor: constructor,
                                                menu: menu,
                                                elementType: elementType };
    ElementController.elements.byType[elementType] =
                          ElementController.elements.byType[elementType] || [];
    ElementController.elements.byType[elementType].push(name);
  };


  return ElementController;
});
