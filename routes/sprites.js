var fs = require('fs');
var path = require('path');
var verifier = require('verifier');
var _ = require('underscore');

var spriteTemplate = {
  pixels: [ {x: 'number', y: 'number', color: 'string'} ],
  center: { x: 'number', y: 'number' }
};

exports.all = function (req, res) {
  var spriteDir = __dirname + '/../public/assets/sprites/';
  fs.readdir(spriteDir, function (err, files) {
    var names;

    if(err) res.send(500);
    else{
      names = _.map(files, function (f) {
        return path.basename(f, '.json');
      });
      res.json(200, names);
    }
  });
};

exports.load = function (req, res) {
  var filename = __dirname + '/../public/assets/sprites/' + req.params.name;
  filename += '.json';

  fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
    if(err) res.send(404);
    else{
      res.type('application/json');
      res.send(200, data);
    }
  });
};


exports.save = function (req, res) {
  var filename = __dirname + '/../public/assets/sprites/' + req.params.name;
  filename += '.json';
  
  if(!req.params.name || verifier.validate(req.body, spriteTemplate) === null){
    res.send(400);
  }
  else{
    fs.writeFile(filename, JSON.stringify(req.body), function (err) {
      if(err) res.send(500);
      else res.send(200);
    });
  }
};
