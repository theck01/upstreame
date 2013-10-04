var _ = require("underscore");

module.exports = function (obj, propList) {
  var hasAll = _.reduce(propList, function (memo, prop) {
    return memo && _.has(obj, prop);
  }, true);

  if(hasAll && _.keys(obj).length === propList.length) return true;
  return false;
};
