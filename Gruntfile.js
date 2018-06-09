module.exports = function(grunt) {
  
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
  
  grunt.initConfig({
    responsive_images: {
      options: {
        //Task-specific options go here.
      },
      files: [{
        expand: true,
        src:['img/**.{jpg,gif,png}'],
        cwd: 'test/',
        dest: 'tmp/'
      }]
    }
  })
}