var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/bootstrap/',
            src: ['js/**', 'less/**'],
            dest: 'app/public/vendor/bootstrap/',
          },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/',
            src: ['fonts/**'],
            dest: 'app/public/',
          },
          {
            expand: true, cwd: 'bower_components/bootstrap3-datetimepicker/',
            src: ['build/**'], dest: 'app/public/vendor/bootstrap3-datetimepicker/',
          },
          {
            expand: true, cwd: 'bower_components/backbone/',
            src: ['backbone.js'], dest: 'app/public/vendor/backbone/'
          },
          {
            expand: true, cwd: 'bower_components/font-awesome/',
            src: ['fonts/**', 'less/**'], dest: 'app/public/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'bower_components/html5shiv/dist/',
            src: ['html5shiv.js'], dest: 'app/public/vendor/html5shiv/'
          },
          {
            expand: true, cwd: 'bower_components/jquery/dist/',
            src: ['jquery.js'], dest: 'app/public/vendor/jquery/'
          },
          {
            expand: true, cwd: 'bower_components/jquery.cookie/',
            src: ['jquery.cookie.js'], dest: 'app/public/vendor/jquery.cookie/'
          },
          {
            expand: true, cwd: 'bower_components/knockout/',
            src: ['index.js'], dest: 'app/public/vendor/knockout/',
            rename: function(dest, src) {
              return dest + 'knockout.js';
            }
          },
          {
            expand: true, cwd: 'bower_components/moment/min/',
            src: ['moment.min.js'], dest: 'app/public/vendor/moment/'
          },
          {
            expand: true, cwd: 'bower_components/respond/src/',
            src: ['respond.js'], dest: 'app/public/vendor/respond/'
          },
          {
            expand: true, cwd: 'bower_components/underscore/',
            src: ['underscore.js'], dest: 'app/public/vendor/underscore/'
          }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ignore: [
            'node_modules/**',
            'app/public/**'
          ],
          ext: 'js'
        }
      }
    },
    watch: {
      clientJS: {
        files: [
          'app/public/views/**/*.js', '!public/views/**/*.min.js'
        ],
        tasks: ['newer:uglify', 'newer:jshint:client']
      },
      serverJS: {
        files: [
          'app/server/controllers/**/*.js',
          'app/server/models/**/*.js',
          'app/server/views/**/*.js',
        ],
        tasks: ['newer:jshint:server']
      },
      clientLess: {
        files: [
          'app/public/views/**/*.less',
          'app/public/less/**/*.less'
        ],
        tasks: ['newer:less']
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      layouts: {
        files: {
          'app/public/js/core.min.js': [
            'app/public/vendor/jquery/jquery.js',
            'app/public/vendor/jquery.cookie/jquery.cookie.js',
            'app/public/vendor/underscore/underscore.js',
            'app/public/vendor/backbone/backbone.js',
            'app/public/vendor/bootstrap/js/affix.js',
            'app/public/vendor/bootstrap/js/alert.js',
            'app/public/vendor/bootstrap/js/button.js',
            'app/public/vendor/bootstrap/js/carousel.js',
            'app/public/vendor/bootstrap/js/collapse.js',
            'app/public/vendor/bootstrap/js/dropdown.js',
            'app/public/vendor/bootstrap/js/modal.js',
            'app/public/vendor/bootstrap/js/tooltip.js',
            'app/public/vendor/bootstrap/js/popover.js',
            'app/public/vendor/bootstrap/js/scrollspy.js',
            'app/public/vendor/bootstrap/js/tab.js',
            'app/public/vendor/bootstrap/js/transition.js',
            'app/public/vendor/moment/moment.min.js',
            'app/public/vendor/knockout/knockout.js',
            'app/public/js/app.js'
          ],
          'app/public/js/ie-sucks.min.js': [
            'app/public/vendor/html5shiv/html5shiv.js',
            'app/public/vendor/respond/respond.js',
            'app/public/js/ie-sucks.js'
          ],
          'app/public/js/main.min.js': ['app/public/js/main.js']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'app/public/views/',
          src: ['**/*.js', '!**/*.min.js'],
          dest: 'app/public/views/',
          ext: '.min.js'
        }]
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'app/public/views/**/*.min.js'
          ]
        },
        src: [
          'app/public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'app/server/controllers/**/*.js',
          'app/server/models/**/*.js',
          'app/server/views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true
      },
      layouts: {
        files: {
          'app/public/css/core.min.css': [
            'app/public/less/bootstrap-build.less',
            'app/public/less/core.less'
          ],
          'app/public/css/main.min.css': ['app/public/less/main.less']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'app/public/views/',
          src: ['**/*.less'],
          dest: 'app/public/views/',
          ext: '.min.css'
        }]
      }
    },
    clean: {
      js: {
        src: [
          'app/public/views/**/*.min.js',
          'app/public/views/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'app/public/views/**/*.min.css'
        ]
      },
      vendor: {
        src: ['app/public/vendor/**']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['copy:vendor', 'newer:uglify', 'newer:less', 'concurrent']);
  grunt.registerTask('build', ['copy:vendor', 'uglify', 'less']);
  grunt.registerTask('lint', ['jshint']);
};
