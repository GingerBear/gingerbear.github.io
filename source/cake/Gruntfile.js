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
            files: [ 'css/**/*.css' ],
            tasks: [ 'default' ]
        },
        js: {
            files: [ 'js/**/*.js' ],
            tasks: [ 'default' ]
        }
      }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask( "default", [ "watch" ] );

};