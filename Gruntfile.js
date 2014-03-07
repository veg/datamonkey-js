module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['assets/js/hivtrace/*.js'],
        dest: 'public/assets/js/hivtrace.js'
      },
      dist: {
        src: ['assets/js/datamonkey/*.js'],
        dest: 'public/assets/js/datamonkey.js'
      }
    },
    watch: {
      files: ['assets/js/**/*.js'],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat']);

};
