var fs = require('fs');
var path = require('path');
var verifier = require('verifier');
var _ = require('underscore');

var spriteTemplate = {
  pixels: [ {x: 'number', y: 'number', color: 'string'} ],
  center: { x: 'number', y: 'number' },
  backgroundColor: 'string',
  currentColor: 'string',
  dimensions: { width: 'number', height: 'number' }
};

exports.all = function (req, res) {
  var sprites;
  var spriteDir = __dirname + '/../public/assets/sprites/';

  fs.readdir(spriteDir, function (err, files) {

    if(err) res.send(500);
    else{
      sprites = _.reduce(files, function (memo, f) {
        var file = __dirname + '/../public/assets/sprites/' + f;
        var name = path.basename(f, '.json');
        memo[name] = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
        return memo;
      }, Object.create(null));

      res.json(200, sprites);
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
