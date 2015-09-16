module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
          src: ['tests/msa.js'],
          options: {
                run: true,
                debug: true,
              },
          },
    },

    jshint: {
      ignore_warning: {
        options: {
          '-W015': true,
        },
        src: ['lib/**/*.js', 'app/**/*.js', 'lib/**/*.js*'],
      },
    },

    watch: {
      files: ['lib/**/*.js', 'app/**/*.js', 'tests/*.js', 'lib/**/*.js*', 'public/assets/lib/datamonkey/**/*.js', 'tests/**/*.js*'],
      tasks: ['mochaTest']
    }

  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['mochaTest']);

};
