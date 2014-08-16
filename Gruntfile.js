module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      src: ['public/javascripts', 'public/stylesheets']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      index: {
        src: 'app.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      release: {
        files: [{
          expand: true,
          cwd: 'javascripts',
          src: '*.js',
          dest: 'public/javascripts'
        }]
      },
      debug: {
        options: {
          compress: false,
          mangle: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: 'javascripts',
          src: '**/*.js',
          dest: 'public/javascripts'
        }]
      }
    },
    sass: {
      release: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/stylesheets/style.css': 'scss/app.scss'
        }
      },
      debug: {
        files: {
          'public/stylesheets/style.css': 'scss/app.scss'
        }
      }
    },
    autoprefixer: {
      'default': {
        'public/stylesheets/style.css': 'public/stylesheets/style.css'
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'clean', 'uglify:release', 'sass:release', 'autoprefixer']);
  grunt.registerTask('debug', ['jshint', 'clean', 'uglify:debug', 'sass:debug', 'autoprefixer']);

};