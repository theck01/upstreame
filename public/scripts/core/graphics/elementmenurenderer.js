define(['underscore', 'jquery'], function (_, $) {

  // ElementMenuRenderer renders raw element menu objects as HTML
  var ElementMenuRenderer = Object.create(null);


  // renderMenu renders a specific menu, returning a jQuery DOM tree
  // representing the menu
  //
  // Arguments: 
  //   menu: object with keys equaling field names of parameters in element
  //         constructors and values equaling default values to fill menu.
  //         Values may be numbers, strings, or objects containing numbers
  //         strings and/or objects....
  ElementMenuRenderer.renderMenu = function (menu) {
    return _.reduce(menu, function ($menu, fieldValue, fieldName) {
      var $controlRow = $('<div/>', { 'class': 'control-row' });
      $controlRow.append(ElementMenuRenderer._renderField(fieldName,
                                                          fieldValue));
      $menu.append($controlRow);
      return $menu;
    }, $('<div/>', { 'class': 'well' }));
  };


  // render a specific field in the menu
  //
  // Arguements:
  //   fieldName: name of the field to render
  //   fieldValue: value of field to render
  ElementMenuRenderer._renderField = function (fieldName, fieldValue) {
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
      $fieldInput = ElementMenuRenderer._renderSubMenu(fieldValue);
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
  ElementMenuRenderer._renderSubMenu = function (subMenu) {
    return _.reduce(subMenu, function ($menu, fieldValue, fieldName) {
      $menu.append(ElementMenuRenderer._renderField(fieldName, fieldValue));
      return $menu;
    }, $('<div/>', { 'class': 'submenu' }));
  };


  return ElementMenuRenderer;
});
