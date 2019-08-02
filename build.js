(() => {
    "use strict";

    /* eslint-disable no-console */
    /* global Func, path */

    global.modulePath = __dirname + "/node_modules/";

    try {
        require("../node.js_Build/funcs");
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            throw e;
        }
        console.error("Build script is missing. Please download from https://github.com/Kiuryy/node.js_Build");
        process.exit(1);
    }

    // SCSS Filewatcher -> <PATH_TO_node>/npm.cmd run scss

    /**
     * Starts building the application
     */
    const Build = () => {
        const start = +new Date();
        console.log("Building release...\n");

        Func.cleanPre().then(() => {
            return eslintCheck();
        }).then(() => {
            return updateMinimumChromeVersion();
        }).then(() => {
            return remoteJs();
        }).then(() => {
            return js();
        }).then(() => {
            return css();
        }).then(() => {
            return img();
        }).then(() => {
            return json();
        }).then(() => {
            return html();
        }).then(() => {
            return zip();
        }).then(() => {
            return Func.cleanPost();
        }).then(() => {
            console.log("\nRelease built successfully\t[" + (+new Date() - start) + " ms]");
        });
    };

    /*
     * ################################
     * BUILD FUNCTIONS
     * ################################
     */

    /**
     * Copies the images to the dist directory
     *
     * @returns {Promise}
     */
    /**
     * Copies the images to the dist directory
     *
     * @returns {Promise}
     */
    const img = () => {
        return Func.measureTime((resolve) => {
            Func.copy([path.src + "img/**/*"], [path.src + "**/*.xcf", path.src + "img/icon/dev/**"], path.dist, false).then(() => {
                resolve();
            });
        }, "Moved image files to dist directory");
    };

    /**
     * Parses the scss files and copies the css files to the dist directory
     *
     * @returns {Promise}
     */
    const css = () => {
        return Func.measureTime((resolve) => {
            Func.minify([ // parse scss files
                path.src + "scss/*.scss"
            ], path.dist + "css/").then(() => {
                resolve();
            });
        }, "Moved css files to dist directory");
    };

    /**
     * Retrieves the newest versions of the lib js files from Github
     *
     * @returns {Promise}
     */
    const remoteJs = () => {
        return new Promise((resolve) => {
            let i = 0;
            const files = [
                {
                    file: "jsu.js",
                    urlPath: "jsu.js/master/src/js/jsu.js"
                }
            ];

            const fetched = () => {
                i++;
                if (i === files.length) {
                    resolve();
                }
            };

            files.forEach((obj) => {
                Func.measureTime((rslv) => {
                    Func.getRemoteContent("https://raw.githubusercontent.com/Kiuryy/" + obj.urlPath).then((content) => {
                        Func.createFile(path.src + "js/lib/" + obj.file, content).then(() => {
                            rslv();
                        });
                    }, rslv);
                }, "Fetched " + obj.file + " from Github").then(() => {
                    fetched();
                });
            });
        });
    };

    /**
     * Parses the js files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const js = () => {
        return Func.measureTime((resolve) => {
            Promise.all([
                Func.concat([ // concat extension javascripts
                    path.src + "js/extension.js",
                    path.src + "js/init.js"
                ],
                path.tmp + "extension-merged.js"
                )
            ]).then(() => { // merge anonymous brackets
                return Func.replace({
                    [path.tmp + "extension-merged.js"]: path.tmp + "extension.js"
                }, [
                    [/\}\)\(jsu\);[\s\S]*?\(\$\s*\=\>\s*\{[\s\S]*?\"use strict\";/mig, ""]
                ]);
            }).then(() => { // minify in dist directory
                return Promise.all([
                    Func.minify([
                        path.tmp + "extension.js",
                        path.src + "js/settings.js",
                        path.src + "js/background.js",
                    ], path.dist + "js/"),
                    Func.minify([
                        path.src + "js/lib/jsu.js",
                    ], path.dist + "js/lib/"),
                ]);
            }).then(() => {
                resolve();
            });
        }, "Moved js files to dist directory");
    };

    /**
     * Generate zip file from dist directory
     *
     * @returns {Promise}
     */
    const zip = () => {
        return Func.measureTime((resolve) => {
            Func.zipDirectory(path.dist, process.env.npm_package_name + "_" + process.env.npm_package_version + ".zip").then(resolve);
        }, "Created zip file from dist directory");
    };

    /**
     * Parses the html files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const html = () => {
        return Func.measureTime((resolve) => {
            Func.minify([path.src + "html/**/*.html"], path.dist, false).then(() => {
                resolve();
            });
        }, "Moved html files to dist directory");
    };

    /**
     * Parses the json files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const json = () => {
        return Func.measureTime((resolve) => {
            Func.replace({ // parse manifest.json
                [path.src + "manifest.json"]: path.tmp + "manifest.json"
            }, [
                [/("content_scripts":[\s\S]*?"js":\s?\[)([\s\S]*?)(\])/mig, "$1\"js/extension.js\"$3"],
                [/("version":[\s]*")[^"]*("[\s]*,)/ig, "$1" + process.env.npm_package_version + "$2"],
                [/"version_name":[^,]*,/ig, ""],
                [/(img\/icon\/)dev\/(.*\.png)/ig, "$1$2"]
            ]).then(() => { // minify in dist directory
                return Func.minify([path.tmp + "manifest.json", path.src + "_locales/**/*.json"], path.dist, false);
            }).then(() => {
                resolve();
            });
        }, "Moved json files to dist directory");
    };


    /**
     * Updates the mininum Chrome version in the manifest.json to the current version - 4
     *
     * @returns {Promise}
     */
    const updateMinimumChromeVersion = () => {
        return Func.measureTime((resolve) => {
            Func.getRemoteContent("https://omahaproxy.appspot.com/all.json").then((content) => {
                const result = JSON.parse(content);
                let currentVersion = null;

                result.some((platform) => {
                    if (platform.os === "win64") {
                        platform.versions.some((info) => {
                            if (info.channel === "stable") {
                                currentVersion = +info.version.replace(/(\d+)\..*$/, "$1");
                                return true;
                            }
                        });
                        return true;
                    }
                });

                if (!currentVersion) {
                    console.error("Could not determine current Chrome version");
                    process.exit(1);
                } else {
                    const minVersion = currentVersion - 4;

                    Func.replace({ // update the min version in the manifest
                        [path.src + "manifest.json"]: path.src + "manifest.json"
                    }, [
                        [/("minimum_chrome_version":[\s]*")[^"]*("[\s]*,)/ig, "$1" + (minVersion) + "$2"]
                    ]).then(() => {
                        resolve("v" + minVersion);
                    });
                }


            });
        }, "Updated minimum chrome version");
    };

    /**
     * Performs eslint checks for the build and src/js directories
     *
     * @returns {Promise}
     */
    const eslintCheck = async () => {
        for (const files of ["build.js", path.src + "js/**/*.js"]) {
            await Func.measureTime(async (resolve) => {
                Func.cmd("eslint --fix " + files).then((obj) => {
                    if (obj.stdout && obj.stdout.trim().length > 0) {
                        console.error(obj.stdout);
                        process.exit(1);
                    }
                    resolve();
                });
            }, "Performed eslint check for " + files);
        }
    };

    //
    //
    //
    Build();
})();