module.exports = function(grunt) {
  "use strict";

  var purs_src_pattern = "app/assets/purs/**/*.purs",
      purs_lib_pattern = "public/components/**/src/**/*.purs";

  grunt.initConfig({

    psc: {
      options: {
        main: "Main",
        modules: ["Main"]
      },
      all: {
        src: [ purs_src_pattern
             , purs_lib_pattern],
        dest: "public/purs/main.js"
      }
    },
    watch: {
      files: [ purs_src_pattern
             , purs_lib_pattern],
      tasks: ["psc:all"]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-purescript");

  grunt.registerTask("default", ["psc:all"]);
};
