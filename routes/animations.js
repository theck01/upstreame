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
    if(err) res.send(404);
    else{
      res.type('application/json');
      res.send(200, data);
    }
  });
};


exports.save = function (req, res) {
  var filename = __dirname + '/../public/assets/animations/' + req.params.name;
  filename += '.json';

  console.log(req.body);
  console.log(animationTemplate);
  
  if (!req.params.name ||
      verifier.validate(req.body, animationTemplate) === null){
    res.send(400);
  }
  else{
    fs.writeFile(filename, JSON.stringify(req.body), function (err) {
      if(err) res.send(500);
      else res.send(200);
    });
  }
};
