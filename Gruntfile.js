/* License: MIT.
 * Copyright (C) 2013, 2014, 2015, Uri Shaked.
 */

'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  var yeoman = {
    paths: {
      tmp: '.tmp',
      src: 'src',
      test: 'test'
    }
  };

  grunt.initConfig({
    yeoman: yeoman,
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/*.js',
        'test/*.test.js'
      ]
    },
    copy: {
      dist: {
        cwd: 'src/',
        src: ['*.js'],
        dest: 'dist/',
        expand: true
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        files: {
          'dist/mfw-ionic-inapp-browser.service.min.js': 'src/mfw-ionic-inapp-browser.service.js'
        }
      }
    },
    ngdocs: {
      options: {
        startPage: '/api/mfw-ionic.inapp-browser',
        title: false,
        html5Mode: false,
        editLink: false,
        editExample: false,
        dest: 'docs'
      },
      api: {
        src: 'src/*.js',
        title: 'MFW Ionic InApp Browser API Documentation'
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      docs: {
        options: {
          open: true,
          base: './docs'
        }
      }
    },
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.paths.src %>/app/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['<%= yeoman.paths.test %>/spec/**/*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: [
          '<%= yeoman.paths.src %>/assets/css/**/*.css',
          '<%= yeoman.paths.src %>/assets/scss/**/*.scss'
        ],
        tasks: ['sass', 'newer:copy:styles', 'autoprefixer']
      },
      html: {
        files: ['<%= yeoman.paths.src %>/**/*.html'],
        tasks: [
          'copy:generate-html',
          'copy:generated-html',
          'preprocess:local'
        ]
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.paths.src %>/**/*.html',
          '<%= yeoman.paths.tmp %>/assets/css/**/*.css',
          '<%= yeoman.paths.src %>/assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      e2eTest: {
        files: [
          '<%= yeoman.paths.test %>/e2e/**/*.js',
          '<%= yeoman.paths.src %>/app/**/*.js',
          '<%= yeoman.paths.src %>/**/*.html',
          '<%= yeoman.paths.tmp %>/assets/css/**/*.css',
          '<%= yeoman.paths.src %>/assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }
  });

  /**
   * Register tasks
   */
  grunt.registerTask('serve', 'Compile then start a connect web server. Can use different endpoint environments: local, development, staging and production.', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'copy',
    'uglify'
  ]);
  grunt.registerTask('docs', ['ngdocs']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('viewdocs', ['serve:docs']);
};
