var fs = require('fs');
var verifier = require('verifier');

var animationTemplate = {
  'backgroundColor': 'string',
  'dimensions': { 'width': 'number', 'height': 'number' },
  'framesPerSprite': 'number',
  'spriteList': ['string']
};


exports.load = function (req, res) {
  var filename = __dirname + '/../public/assets/animations/' + req.params.name;
  filename += '.json';

  fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
    if(err) res.status(404).end();
    else{
      res.type('application/json');
      res.status(200).send(data);
    }
  });
};


exports.save = function (req, res) {
  var filename = __dirname + '/../public/assets/animations/' + req.params.name;
  filename += '.json';
  
  if (!req.params.name ||
      verifier.validate(req.body, animationTemplate) === null){
    res.status(400).end();
  }
  else{
    fs.writeFile(filename, JSON.stringify(req.body), function (err) {
      if(err) res.status(500).end();
      else res.status(200).end();
    });
  }
};
