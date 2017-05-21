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
        concat: {
            dist: {
                options: {},
                src: [path.src + 'js/extension.js', path.src + 'js/init.js'],
                dest: 'tmp/extension-merged.js'
            }
        },
        babel: {
            dist: {
                options: {
                    presets: ['babel-preset-es2015', 'babel-preset-es2016', 'babel-preset-es2017']
                },
                files: {
                    ['tmp/extension-es5.js']: 'tmp/extension-merged.js',
                    ['tmp/jsu-es5.js']: path.src + 'js/lib/jsu.js',
                    ['tmp/settings-es5.js']: path.src + 'js/settings.js',
                    ['tmp/model-es5.js']: path.src + 'js/model.js'
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '/*! (c) <%= pkg.author %> under <%= pkg.license %> */\n',
                    mangle: {
                        reserved: ['jsu', 'chrome']
                    }
                },
                files: {
                    ['tmp/js/extension.js']: 'tmp/extension-es5.js',
                    ['tmp/js/lib/jsu.js']: 'tmp/jsu-es5.js',
                    ['tmp/js/settings.js']: 'tmp/settings-es5.js',
                    ['tmp/js/model.js']: 'tmp/model-es5.js',
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
            distManifest: {
                options: {
                    replacements: [{
                        pattern: /("content_scripts":[\s\S]*?"js":\s?\[)([\s\S]*?)(\])/mig,
                        replacement: '$1"js/extension.js"$3'
                    }, {
                        pattern: /("version":[\s]*")[^"]*("[\s]*,)/ig,
                        replacement: '$1<%= pkg.version %>$2'
                    }, {
                        pattern: /"version_name":[^,]*,/ig,
                        replacement: ''
                    }, {
                        pattern: /(img\/icon\/)dev\/(.*)\.png/ig,
                        replacement: '$1$2.webp'
                    }]
                },
                files: {
                    ['tmp/manifest.json']: path.src + 'manifest.json'
                }
            }
        },
        json_minification: {
            dist: {
                files: [
                    {expand: true, cwd: "tmp", src: ['manifest.json'], dest: path.dist},
                    {expand: true, cwd: path.src + "_locales", src: ['**/*.json'], dest: path.dist + "_locales"}
                ]
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: path.src, src: ['img/**', '!**/*.xcf', '!img/icon/dev/**'], dest: path.dist},
                    {expand: true, cwd: "tmp/", src: ['js/**'], dest: path.dist}
                ]
            }
        },
        clean: {
            sass: {
                src: ['.sass-cache/**']
            },
            distPre: {
                src: ['dist/*']
            },
            distPost: {
                src: ['tmp/**']
            }
        }
    });


    [
        'grunt-contrib-sass',
        'grunt-contrib-concat',
        'grunt-babel',
        'grunt-contrib-uglify',
        'grunt-contrib-htmlmin',
        'grunt-string-replace',
        'grunt-json-minification',
        'grunt-contrib-copy',
        'grunt-contrib-clean'
    ].forEach((task) => {
        grunt.loadNpmTasks(task);
    });

    grunt.registerTask('scss', ['sass:src', 'clean:sass']);
    grunt.registerTask('release', [
        'clean:distPre',
        'concat:dist',
        'babel:dist',
        'uglify:dist',
        'htmlmin:dist',
        'string-replace:distManifest',
        'json_minification:dist',
        'sass:dist',
        'copy:dist',
        'clean:sass',
        'clean:distPost'
    ]);

    // UPDATE NPM devDependencies -> 'npm update --dev --save'
};