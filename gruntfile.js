module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uncss: {
            dist: {
                files: {
                    'src/static/css/main.css': ['src/views/*.html']
                }
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/static/css/',
                    src: ['main.css'],
                    dest: 'src/static/css/',
                    ext: '.min.css'

                }]
            }
        },
        processhtml: {
            dist: {
                files: {
                    'src/views/_base.html': ['src/views/_base.html'],
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-processhtml');

    // Default task(s).
    grunt.registerTask('default', ['uncss', 'cssmin', 'processhtml']);
};