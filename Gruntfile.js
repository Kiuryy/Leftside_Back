module.exports = function (grunt) {
    "use strict";

    let path = {
        src: "src/",
        dist: "dist/"
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            src: {
                options: {
                    update: true,
                    sourcemap: 'auto',
                    style: 'expanded'
                },
                files: [{
                    expand: true,
                    cwd: path.src + 'scss',
                    src: ['*.scss'],
                    dest: path.src + 'css/',
                    ext: '.css'
                }]
            },
            dist: {
                options: {
                    sourcemap: 'none',
                    style: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: path.src + 'scss',
                    src: ['*.scss'],
                    dest: path.dist + 'css/',
                    ext: '.css'
                }]
            }
        },
        babel: {
            dist: {
                options: {
                    presets: ['babel-preset-es2015']
                },
                files: {
                    ['tmp/jsu-es5.js']: path.src + 'js/lib/jsu.js',
                    ['tmp/main-es5.js']: path.src + 'js/main.js',
                    ['tmp/visual-es5.js']: path.src + 'js/visual.js',
                    ['tmp/settings-es5.js']: path.src + 'js/settings.js'
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) <%= pkg.author %> under <%= pkg.license %> */\n',
                    mangle: {
                        except: ['jsu']
                    }
                },
                files: {
                    ['tmp/js/lib/jsu.js']: 'tmp/jsu-es5.js',
                    ['tmp/js/settings.js']: 'tmp/settings-es5.js',
                    ['tmp/js/main.js']: 'tmp/main-es5.js',
                    ['tmp/js/visual.js']: 'tmp/visual-es5.js'
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: path.src + "html",
                    src: '*.html',
                    dest: path.dist + "html/"
                }]
            }
        },
        'string-replace': {
            dist: {
                options: {
                    replacements: [{
                        pattern: /("version":[\s]*")[^"]*("[\s]*,)/ig,
                        replacement: '$1<%= pkg.version %>$2'
                    }, {
                        pattern: /"version_name":[^,]*,/ig,
                        replacement: ''
                    }, {
                        pattern: /(img\/icon\/)dev\//ig,
                        replacement: '$1'
                    }]
                },
                files: {
                    ['tmp/manifest-parsed.json']: path.src + 'manifest.json'
                }
            }
        },
        minjson: {
            dist: {
                files: {
                    [path.dist + 'manifest.json']: 'tmp/manifest-parsed.json'
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: path.src, src: ['_locales/**'], dest: path.dist},
                    {
                        expand: true,
                        cwd: path.src,
                        src: ['img/**', '!**/*.xcf', '!img/icon/dev/**', '!img/demo/**'],
                        dest: path.dist
                    },
                    {expand: true, cwd: "tmp/", src: ['js/**'], dest: path.dist},
                    {expand: true, src: ['changelog.txt', 'license.txt'], dest: path.dist}
                ]
            }
        },
        clean: {
            distPre: {
                src: ['dist/*']
            },
            distPost: {
                src: ['tmp/**', '.sass-cache/**']
            }
        }
    });


    [
        'grunt-contrib-sass',
        'grunt-babel',
        'grunt-contrib-uglify',
        'grunt-contrib-htmlmin',
        'grunt-string-replace',
        'grunt-minjson',
        'grunt-contrib-copy',
        'grunt-contrib-clean'
    ].forEach((task) => {
        grunt.loadNpmTasks(task);
    });

    grunt.registerTask('scss', ['sass:src']);
    grunt.registerTask('release', [
        'clean:distPre',
        'babel:dist',
        'uglify:dist',
        'htmlmin:dist',
        'string-replace:dist',
        'minjson:dist',
        'sass:dist',
        'copy:dist',
        'clean:distPost'
    ]);

};