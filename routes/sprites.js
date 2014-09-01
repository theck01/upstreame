var fs = require('fs');
var path = require('path');
var verifier = require('verifier');
var _ = require('underscore');

var spriteTemplate = {
  pixels: [ {x: 'number', y: 'number', color: 'string'} ],
  backgroundColor: 'string',
  currentColor: 'string',
  dimensions: { width: 'number', height: 'number' }
};

exports.all = function (req, res) {
  var sprites;
  var spriteDir = __dirname + '/../public/assets/sprites/';

  fs.readdir(spriteDir, function (err, files) {

    if(err) res.status(500).json('Internal server error');
    else{
      sprites = _.reduce(files, function (memo, f) {
        var file = __dirname + '/../public/assets/sprites/' + f;
        var name = path.basename(f, '.json');

        if (fs.lstatSync(file).isFile()) {
          memo[name] = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
        }
        return memo;
      }, Object.create(null));

      res.status(200).json(sprites);
    }
  });
};

exports.load = function (req, res) {
  var filename = __dirname + '/../public/assets/sprites/' + req.params.name;
  filename += '.json';

  fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
    if(err) res.status(404).json(
        'Sprite named ' + req.params.name + ' not found.');
    else{
      res.type('application/json').status(200).send(data);
    }
  });
};


exports.save = function (req, res) {
  var filename = __dirname + '/../public/assets/sprites/' + req.params.name;
  filename += '.json';
  
  if(!req.params.name) {
    res.status(400).send('Sprite name required to save.');
    return;
  }

  var sprite = verifier.validate(req.body, spriteTemplate, function (msg) {
    res.status(400).send(msg);
  });

  if (sprite) {
    fs.writeFile(filename, JSON.stringify(req.body), function (err) {
      if(err) res.status(500).send('Internal server error.');
      else res.status(200).end();
    });
  }
};
