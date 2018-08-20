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
    },
    
    cwebp: {
      dynamic: {
        options: {
          q: 60
        },
        files: [
          {
            expand: true,
            cwd: “img/”,
            src: ["*.jpg"],
            dest: “img/”
          }
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-cwebp');
  
  grunt.registerTask('default', ['responsive_images', "cwebp"])
}