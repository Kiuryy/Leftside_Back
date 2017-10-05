(() => {
    "use strict";

    window.ext = function (opts) {

        let port = null;
        let callbacks = {};
        let mouseNotTopLeft = false;

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        this.initialized = null;

        /**
         * Constructor
         */
        this.run = () => {
            initPort();
            initConfig();
            this.initialized = +new Date();
        };

        /*
         * ################################
         * PRIVATE
         * ################################
         */

        /**
         * Initialises the configuration values for the extension
         */
        let initConfig = () => {
            let configFields = ["pxTolerance", "showIndicator", "closeTab", "openAction"];
            chrome.storage.sync.get(configFields, (obj) => {
                configFields.forEach((field) => {
                    if (typeof obj[field] !== "undefined") {
                        opts.config[field] = obj[field];
                    }
                });

                if (matchMedia("(min-resolution: 1.25dppx)").matches) { // hdpi monitor -> increase pixel tolerance by one
                    Object.keys(opts.config.pxTolerance).forEach((key) => {
                        opts.config.pxTolerance[key]++;
                    });
                }

                initEvents();
                initIndicator();
                extensionLoaded();
            });
        };

        /**
         * Return the amount of pixel in which range the sidebar will open if the user clicks
         *
         * @returns {int}
         */
        let getPixelTolerance = () => {
            let isWindowed = window.screenX !== 0 || window.screenY !== 0 || window.screen.availWidth !== window.innerWidth;
            return +opts.config.pxTolerance[isWindowed ? "windowed" : "maximized"];
        };

        /**
         * Initialises the port to the background script
         *
         * @returns {Promise}
         */
        let initPort = () => {
            return new Promise((resolve) => {
                if (port) {
                    port.disconnect();
                }

                port = chrome.runtime.connect({name: "background"});

                port.onMessage.addListener((obj) => {
                    if (callbacks[obj.uid]) {
                        callbacks[obj.uid](obj.result);
                        delete callbacks[obj.uid];
                    }
                });

                resolve();
            });
        };

        /**
         * Sends a message to the background script and resolves when receiving a response
         *
         * @param {string} key
         * @param {object} opts
         * @returns {Promise}
         */
        let sendMessage = (key, opts = {}) => {
            return new Promise((resolve) => {
                if (port) {
                    opts.type = key;
                    opts.uid = key + "_" + JSON.stringify(opts) + "_" + (+new Date()) + Math.random().toString(36).substr(2, 12);

                    callbacks[opts.uid] = (response) => {
                        resolve(response);
                    };

                    try { // can fail if port is closed in the meantime
                        port.postMessage(opts);
                    } catch (e) {
                    }
                }
            });
        };

        /**
         * Performs the action,
         * navigates back in history or closes the tab if there is no other history entry
         */
        let performAction = () => {
            let useFallback = true;
            window.onbeforeunload = window.onpopstate = () => {
                useFallback = false
            };

            window.history.back();

            setTimeout(() => {
                if (opts.config.closeTab && useFallback) {
                    sendMessage("closeTab");
                }
            }, 200);
        };

        /**
         * Initialises the eventhandlers
         */
        let initEvents = () => {
            document.addEventListener(opts.config.openAction, (e) => {
                if (e.isTrusted && (opts.config.openAction !== "mousedown" || e.button === 0) && isMousePosInPixelTolerance(e.pageX, e.pageY)) { // check mouse position and mouse button
                    e.stopPropagation();
                    e.preventDefault();
                    performAction();
                }
            });

            document.addEventListener("DOMContentLoaded", () => {
                initIndicator();
            });

            chrome.extension.onMessage.addListener((message) => { // listen for events from the background script
                if (message && message.action && (message.reinitialized === null || this.initialized > message.reinitialized)) { // background is not reinitialized after the creation of this instance of the script -> perform the action
                    if (message.action === "navigateBack") { //
                        performAction();
                    }
                }
            });
        };

        /**
         * Initialises the indicator
         */
        let initIndicator = () => {
            if (document && document.body && document.querySelector("#" + opts.ids.indicator) === null) { // prevent if document is not ready yet or indicator is already initialised
                let elm = document.createElement('div');
                elm.id = opts.ids.indicator;
                document.body.appendChild(elm);

                elm.style.width = getPixelTolerance() + "px";

                if (opts.config.showIndicator) { // show arrow on black background
                    elm.classList.add(opts.classes.visible);

                    document.addEventListener("mousemove", (e) => { // check mouse position
                        if (e.isTrusted && isMousePosInPixelTolerance(e.pageX, e.pageY)) {
                            elm.classList.add(opts.classes.hover);
                        } else if (typeof e.pageX === "undefined" || e.pageX >= opts.config.indicatorWidth) {
                            elm.classList.remove(opts.classes.hover);
                        }
                    });

                    document.addEventListener("visibilitychange", () => {
                        if (document.hidden) {
                            elm.classList.remove(opts.classes.hover);
                        }
                    });

                    window.addEventListener("resize", () => {
                        elm.style.width = getPixelTolerance() + "px";
                    }, {passive: true});
                }
            }
        };

        /**
         * Checks whether the given mouse position is in the configured pixel tolence
         *
         * @param {int} pageX
         * @param {int} pageY
         * @returns {boolean}
         */
        let isMousePosInPixelTolerance = (pageX, pageY) => {
            let ret = false;
            if (typeof pageX !== "undefined" && pageX !== null) {
                if ((pageX > 0 || pageY > 0) || mouseNotTopLeft) { // protection from unwanted triggers with x = 0 and y = 0 on pageload
                    mouseNotTopLeft = true;
                    let indicator = document.querySelector("#" + opts.ids.indicator);

                    if (indicator) { // indicator is existing
                        let pixelTolerance = getPixelTolerance();
                        if (indicator.classList.contains(opts.classes.visible) && indicator.classList.contains(opts.classes.hover) && opts.config.indicatorWidth > pixelTolerance) { // indicator is visible -> allow click across the indicator width if it is wider then the pixel tolerance
                            pixelTolerance = opts.config.indicatorWidth;
                        }

                        ret = pageX < pixelTolerance;
                    }
                }
            }

            return ret;
        };

        /**
         * Fires an event to indicate, that the extension is loaded completely
         */
        let extensionLoaded = () => {
            document.dispatchEvent(new CustomEvent(opts.events.loaded, {
                detail: {
                    pxTolerance: getPixelTolerance(),
                    showIndicator: opts.config.showIndicator
                },
                bubbles: true,
                cancelable: false
            }));
        };
    };
})();
