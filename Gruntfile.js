module.exports = function(grunt) {
  
  grunt.initConfig({
    responsive_images: {
      myTask:{
      options: {
        //Task-specific options go here.
      },
      files: [{
        expand: true,
        src:['**.{jpg,gif,png}'],
        cwd: 'img/',
        dest: 'img/resize'
      }]
    }
    }
  });
  
  grunt.loadNpmTasks('grunt-responsive-images');
  
  grunt.registerTask('default', ['responsive_images'])
}