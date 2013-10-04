module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'app.js', 'public/**/*.js', 'routes/**/*.js',
            'spec/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    less: {
      development: {
        files: [{
          expand: true,
          cwd: 'public/less/',
          src: '*.less',
          dest: 'public/css/',
          ext: '.css'
        }]
      },
      production: {
        options: {
          yuicompress: true
        },
        files: [{
          expand: true,
          cwd: 'public/less/',
          src: '*.less',
          dest: 'public/css/',
          ext: '.min.css'
        }]
      }
    },
    simplemocha: {
      all: {
        src: ['spec/**/*.spec.js']
      },
      options: {
        reporter: 'spec'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-simple-mocha');
};
