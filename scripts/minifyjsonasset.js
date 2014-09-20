#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

// print usage to command line and exit with code
function usage (exitcode) {
  console.log(path.basename(process.argv[1]) + ':');
  console.log('Concatenates all lines in a json file into a single line.');
  console.log('Usage:');
  console.log(path.basename(process.argv[1]) + ' <file>');
  process.exit(exitcode);
}


if (process.argv.length !== 3) usage(1);

var json = fs.readFileSync(process.argv[2], { encoding: 'utf8' });
var spriteModel = JSON.parse(json);
fs.writeFileSync(process.argv[2], JSON.stringify(spriteModel));
