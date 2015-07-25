/*globals module, require */
module.exports = function (grunt) {
  'use strict';

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  var scripts = [
        'src/angular-thumbnails.js'
    ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsvalidate: {
      options: {
        globals: {},
        esprimaOptions: {},
        verbose: true
      },
      dist: {
        files: {
          src: scripts
        }
      }
    },
    concat: {
      options: {
        separator: ';\n'
      },
      build: {
        src: scripts,
        dest: 'build/angular-thumbnails.concat.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: false,
        beautify: true
      },
      src: {
        src: [ 'build/angular-thumbnails.concat.js' ],
        dest: 'build/angular-thumbnails.js'
      },
      min: {
        src: [ 'build/angular-thumbnails.concat.js' ],
        dest: 'build/angular-thumbnails.min.js',
        options: {
          mangle: false,
          compress: true,
          beautify: false
        },
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          flatten: true,
          src: [
            'build/angular-thumbnails.js',
            'build/angular-thumbnails.min.js'
          ],
          dest: 'dist'
        }]
      }
    },
    clean: {
      dist: [ "dist/*" ],
      build: [ "build" ]
    }
  });

  // Default task.
  grunt.registerTask('default', [
    'clean:dist',
    'jsvalidate',
    'concat',
    'uglify',
    'copy',
    'clean:build'
  ]);
};