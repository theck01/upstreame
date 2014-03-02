define(['jquery', 'underscore'], function ($, _) {

  var ElementMenu = Object.create(null);
  ElementMenu.menus = Object.create(null);


  // register a name to a menu object
  //
  // Arguments:
  //   name: String name of the element
  //   menu: object with keys equaling field names of parameters in element
  //         constructors and values equaling default values to fill menu.
  //         Values may be numbers, strings, or objects containing numbers
  //         strings and/or objects....
  ElementMenu.register = function (name, menu) {
    ElementMenu.menus[name] = menu;
  };


  // render the named menu, returning a jQuery DOM tree representing the
  // menu
  //
  // Arguments:
  //   name: name of the menu to render
  ElementMenu.render = function (name) {
    var menu = ElementMenu.menus[name];
    ElementMenu.renderMenu(menu);
  };


  // renderMenu renders a specific menu, returning a jQuery DOM tree
  // representing the menu
  //
  // Arguments: 
  //   menu: object with keys equaling field names of parameters in element
  //         constructors and values equaling default values to fill menu.
  //         Values may be numbers, strings, or objects containing numbers
  //         strings and/or objects....
  ElementMenu.renderMenu = function (menu) {
    return _.reduce(menu, function ($menu, fieldValue, fieldName) {
      var $controlRow = $('<div/>', { 'class': 'control-row' });
      $controlRow.append(ElementMenu._renderField(fieldName, fieldValue));
      $menu.append($controlRow);
      return $menu;
    }, $('<div/>', { 'class': 'well' }));
  };


  // render a specific field in the menu
  //
  // Arguements:
  //   fieldName: name of the field to render
  //   fieldValue: value of field to render
  ElementMenu._renderField = function (fieldName, fieldValue) {
    var $fieldContainer;

    var $fieldLabel = $('<label/>', {

      'class': 'field-label',
      'text': fieldName
    });

    var $fieldInput;
    if (typeof fieldValue === 'number' || typeof fieldValue === 'string') {
      $fieldContainer = $('<div/>', { 'class': 'form-inline' });

      var fieldOpts = { 'class': 'field-input', 'name': fieldName,
                        'val': fieldValue };
      if (typeof fieldValue === 'number') fieldOpts.type = 'number';
      else fieldOpts.type = 'text';
      $fieldInput = $('<input/>', fieldOpts);
    }
    else {
      $fieldContainer = $('<div/>', { 'class': 'form-submenu' });
      $fieldInput = ElementMenu._renderSubMenu(fieldValue);
    }

    $fieldContainer.append($fieldLabel, $fieldInput);
    return $fieldContainer;
  };


  // renderSubMenu renders a specific menu, returning a jQuery DOM tree
  // representing the menu. Styles more condensed than renderMenu
  //
  // Arguments: 
  //   menu: object with keys equaling field names of parameters in element
  //         constructors and values equaling default values to fill menu.
  //         Values may be numbers, strings, or objects containing numbers
  //         strings and/or objects....
  ElementMenu._renderSubMenu = function (subMenu) {
    return _.reduce(subMenu, function ($menu, fieldValue, fieldName) {
      $menu.append(ElementMenu._renderField(fieldName, fieldValue));
      return $menu;
    }, $('<div/>', { 'class': 'submenu' }));
  };


  return ElementMenu;
});
