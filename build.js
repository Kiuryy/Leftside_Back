(async () => {
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

    /**
     *
     * @type {Object}
     */
    let packageJson = {};

    /**
     * Starts building the application
     */
    const Build = async () => {
        const start = +new Date();
        console.log("Building release...\n");

        // Prepare
        await Promise.all([
            Func.cleanPre(),
            loadPackageJson(),
            updateMinimumChromeVersion(),
            eslintCheck()
        ]);

        // Build
        await Promise.all([
            remoteJs(),
            js(),
            css(),
            img(),
            json(),
            html()
        ]);

        // Package
        await zip();
        await Func.cleanPost();

        console.log("\nRelease built successfully\t[" + (+new Date() - start) + " ms]");
    };

    /*
     * ################################
     * BUILD FUNCTIONS
     * ################################
     */

    /**
     * Read the package.json of the project and parse its JSON content into an object
     *
     * @returns {Promise}
     */
    const loadPackageJson = () => {
        return Func.measureTime((resolve) => {
            const fs = require("fs");

            const rawData = fs.readFileSync("package.json");
            const parsedData = JSON.parse(rawData);

            if (parsedData) {
                packageJson = parsedData;
                packageJson.preamble = `(c) ${packageJson.author} under ${packageJson.license}`;
                resolve();
            } else {
                console.error("Could not load package.json");
                process.exit(1);
            }
        }, "Loaded package.json");
    };

    /**
     * Copies the images to the dist directory
     *
     * @returns {Promise}
     */
    const img = () => {
        return Func.measureTime(async (resolve) => {
            await Func.copy([path.src + "img/**/*"], [path.src + "**/*.xcf", path.src + "img/icon/dev/**"], path.dist, false);
            resolve();
        }, "Moved image files to dist directory");
    };

    /**
     * Parses the scss files and copies the css files to the dist directory
     *
     * @returns {Promise}
     */
    const css = () => {
        return Func.measureTime(async (resolve) => {
            await Func.minify([ // parse scss files
                path.src + "scss/**/*.scss"
            ], path.dist, false, packageJson.preamble);

            resolve();
        }, "Moved css files to dist directory");
    };

    /**
     * Parses the js files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const js = () => {
        return Func.measureTime(async (resolve) => {
            await Promise.all([
                // concat extension javascripts
                Func.concat(
                    [
                        path.src + "js/extension.js",
                        path.src + "js/init.js"
                    ],
                    path.tmp + "extension.js"
                ),
                // concat settings javascripts
                Func.concat(
                    [
                        path.src + "js/lib/jsu.js",
                        path.src + "js/settings.js"
                    ],
                    path.tmp + "settings.js"
                )
            ]);

            // minify in dist directory
            await Func.minify([
                path.tmp + "extension.js",
                path.tmp + "settings.js",
                path.src + "js/background.js",
            ], path.dist + "js/");

            resolve();
        }, "Moved js files to dist directory");
    };

    /**
     * Retrieves the newest versions of the lib js files from Github
     *
     * @returns {Promise}
     */
    const remoteJs = async () => {
        const files = [
            {
                file: "jsu.js",
                urlPath: "jsu.js/master/src/js/jsu.js"
            }
        ];

        for (const file of files) {
            await Func.measureTime(async (resolve) => {
                const content = await Func.getRemoteContent("https://raw.githubusercontent.com/Kiuryy/" + file.urlPath);
                await Func.createFile(path.src + "js/lib/" + file.file, content);
                resolve();
            }, "Fetched " + file.file + " from Github");
        }
    };

    /**
     * Parses the html files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const html = () => {
        return Func.measureTime(async (resolve) => {
            await Func.replace({
                [path.src + "html/settings.html"]: path.tmp + "html/settings.html",
            }, [
                [/<\!\-\-\s*\[START\sREMOVE\]\s*\-\->[\s\S]*?<\!\-\-\s*\[END\sREMOVE\]\s*\-\->/mig, ""]
            ]);

            // minify in dist directory
            await Func.minify([path.src + "html/**/*.html"], path.dist, false);
            await Func.minify([path.tmp + "html/**/*.html"], path.dist + "html/");

            resolve();
        }, "Moved html files to dist directory");
    };

    /**
     * Generate zip file from dist directory
     *
     * @returns {Promise}
     */
    const zip = () => {
        return Func.measureTime(async (resolve) => {
            await Func.zipDirectory(path.dist, packageJson.name + "_" + packageJson.versionName + ".zip");
            resolve();
        }, "Created zip file from dist directory");
    };

    /**
     * Parses the json files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const json = () => {
        return Func.measureTime(async (resolve) => {
            await Func.replace({ // parse manifest.json
                [path.src + "manifest.json"]: path.tmp + "manifest.json"
            }, [
                [/("content_scripts":[\s\S]*?"js":\s?\[)([\s\S]*?)(\])/mig, "$1\"js/extension.js\"$3"],
                [/("version":[\s]*")[^"]*("[\s]*,)/ig, "$1" + packageJson.version + "$2"],
                [/("version_name":[\s]*")[^"]*("[\s]*,)/ig, "$1" + packageJson.versionName + "$2"],
                [/(img\/icon\/)dev\/(.*\.png)/ig, "$1$2"]
            ]);

            // minify in dist directory
            await Func.minify([path.tmp + "manifest.json", path.src + "_locales/**/*.json"], path.dist, false);
            resolve();
        }, "Moved json files to dist directory");
    };

    /**
     * Updates the mininum Chrome version in the manifest.json to the current version - 5
     *
     * @returns {Promise}
     */
    const updateMinimumChromeVersion = () => {
        return Func.measureTime(async (resolve) => {
            const content = await Func.getRemoteContent("https://omahaproxy.appspot.com/all.json");
            const result = JSON.parse(content);
            const platform = result.find((r) => r.os === "win64");
            let currentVersion = null;

            for (const info of platform.versions) {
                if (info.channel === "stable") {
                    currentVersion = +info.version.replace(/(\d+)\..*$/, "$1");
                    break;
                }
            }

            if (!currentVersion) {
                console.error("Could not determine current Chrome version");
                process.exit(1);
            } else {
                const minVersion = currentVersion - 5;

                await Func.replace({ // update the min version in the manifest
                    [path.src + "manifest.json"]: path.src + "manifest.json"
                }, [
                    [/("minimum_chrome_version":[\s]*")[^"]*("[\s]*,)/ig, "$1" + (minVersion) + "$2"]
                ]);

                resolve("v" + minVersion);
            }
        }, "Updated minimum chromium version");
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
    await Build();
})();