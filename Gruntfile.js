/*globals module, require */
module.exports = function (grunt) {
  'use strict';

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  var scripts = [
        'build/ts/**/*.js',
        'build/ts/*.js'
    ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      base: {
        src: [
          'typings/**/*.ts',
          'ts/*.ts', 
          'ts/**/*.ts'
        ],
        dest: 'build/ts/',
        options: {
          module: 'commonjs', //or commonjs
          target: 'es5', //or es3 
          sourceMap: true,
          declaration: true
        }
      }
    },
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
    'clean',
    'typescript',
    'jsvalidate',
    'concat',
    'uglify',
    'copy',
    'clean:build'
  ]);
};
