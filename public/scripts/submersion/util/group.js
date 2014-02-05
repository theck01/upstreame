define(['underscore'], function (_) {

  // Group singleton defines groups of elements, used primarily for determining
  // collisions
  var Group = Object.create(null);
  Group.groups = Object.create(null);


  // Submersion groups
  Group.groups.friendlies = ['Submersible', 'FishSchool', 'Turtle'];


  // collect aggregates the members of one or more groups into an array of
  // unique members
  //
  // Arguments:
  //   One or more string group names
  // Returns an array of members
  Group.collect = function () {
    var args = Array.prototype.slice.call(arguments);
    var groups = _.reduce(args, function (set, name) {
      _.each(Group.groups[name], function (e) {
        set[e] = true;
      });

      return set;
    }, Object.create(null));

    return _.keys(groups);
  };



  return Group;
});
