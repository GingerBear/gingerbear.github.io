module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
     watch: {
        options: {
          livereload: {
        		port: 1449,
        	}
        },
        html: {
            files: [ '*.html' ],
            tasks: [ 'default' ]
        },
        css: {
            files: [ 'assets/css/**/*.css' ],
            tasks: [ 'default' ]
        },
        js: {
            files: [ 'assets/js/**/*.js' ],
            tasks: [ 'default' ]
        }
      }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask( "default", [ "watch" ] );

};