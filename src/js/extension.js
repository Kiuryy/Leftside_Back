(() => {
    "use strict";

    window.ext = function (opts) {

        let mouseNotTopLeft = false;
        const configFields = ["pxTolerance", "showIndicator", "closeTab", "navigateForward", "openAction"];

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        // eslint-disable-next-line no-undef
        this.ctx = typeof browser === "undefined" ? chrome : browser;

        this.initialized = null;

        /**
         * Constructor
         */
        this.run = async () => {
            await initConfig();
            initKeepalive();
            this.initialized = +new Date();
        };

        /*
         * ################################
         * PRIVATE
         * ################################
         */

        /**
         *  Workaround to keep service worker alive
         *  https://stackoverflow.com/a/66618269/1660305
         */
        const initKeepalive = () => {
            let port;
            const connect = () => {
                port = this.ctx.runtime.connect({name: "keepalive"});
                port.onDisconnect.addListener(connect);
                port.onMessage.addListener(msg => {
                    // eslint-disable-next-line no-console
                    console.log("keepalive message: ", msg);
                });
            };
            connect();
        };

        /**
         * Initialises the configuration values for the extension
         *
         * @returns {Promise}
         */
        const initConfig = async () => {
            const obj = await this.ctx.storage.sync.get(configFields);
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
        };

        /**
         * Return the amount of pixel in which range the sidebar will open if the user clicks
         *
         * @returns {int}
         */
        const getPixelTolerance = () => {
            const limitX = 100;
            const limitY = 50;
            const isWindowed = window.screenX > limitX ||
                window.screenY > limitY ||
                Math.abs(window.screen.availWidth - window.innerWidth) > limitY ||
                (window.navigator && window.navigator && window.navigator.userAgent && window.navigator.userAgent && window.navigator.userAgent.search(/[/\s-_]mobile[/\s-_]/i) > -1);

            return +opts.config.pxTolerance[isWindowed ? "windowed" : "maximized"];
        };


        /**
         * Sends a message to the background script and resolves when receiving a response
         *
         * @param {string} key
         * @param {object} opts
         * @param {number} retry
         * @returns {Promise}
         */
        const sendMessage = async (key, opts = {}, retry = 0) => {
            let backendDead = false;
            opts.type = key;

            let response = await this.ctx.runtime.sendMessage(opts)["catch"]((err) => {
                if (err && ("" + err).includes("Could not establish connection")) {
                    backendDead = true;
                } else {
                    console.error(err);
                }
            });

            if (backendDead && retry < 50) { // backend got killed by the browser -> it should restart and be available after a short delay, so we try again
                await delay(100);
                response = await sendMessage(key, opts, retry + 1);
            }

            return response;
        };

        /**
         * Returns a promise after the given time in ms
         *
         * @param t
         * @returns Promise
         */
        const delay = (t = 0) => {
            return new Promise((resolve) => {
                setTimeout(resolve, t);
            });
        };

        /**
         * Navigates back in history or closes the tab if there is no other history entry
         */
        const navigateBack = async () => {
            let useFallback = true;
            window.onbeforeunload = window.onpopstate = () => {
                useFallback = false;
            };

            window.history.back();

            await delay(200);
            if (opts.config.closeTab && useFallback) {
                await sendMessage("closeTab");
            }
        };

        /**
         * Navigates forward in history
         */
        const navigateForward = () => {
            window.history.forward();
        };

        /**
         * Initialises the eventhandlers
         */
        const initEvents = () => {
            ["mousedown", "contextmenu"].forEach((eventName) => {
                document.addEventListener(eventName, async (e) => {
                    if (e.isTrusted && (eventName !== "mousedown" || e.button === 0) && isMousePosInPixelTolerance(e.pageX, e.pageY)) { // check mouse position and mouse button
                        e.stopPropagation();
                        e.preventDefault();

                        if (eventName === opts.config.openAction) {
                            await navigateBack();
                        } else if (opts.config.navigateForward) {
                            navigateForward();
                        }
                    }
                });
            });

            document.addEventListener("DOMContentLoaded", () => {
                initIndicator();
            });

            // listen for events from the background script
            this.ctx.runtime.onMessage.removeListener(handleBackgroundMessage);
            this.ctx.runtime.onMessage.addListener(handleBackgroundMessage);
        };

        /**
         * Handles the received message from the background script
         *
         * @param {object} message
         */
        const handleBackgroundMessage = async (message) => {
            if (message && message.action && (message.reinitialized === null || this.initialized > message.reinitialized)) { // background is not reinitialized after the creation of this instance of the script -> perform the action
                if (message.action === "navigateBack") {
                    await navigateBack();
                }
            }
        };

        /**
         * Initialises the indicator
         */
        const initIndicator = () => {
            if (document && document.body && document.querySelector("#" + opts.ids.indicator) === null) { // prevent if document is not ready yet or indicator is already initialised
                const elm = document.createElement("div");
                elm.id = opts.ids.indicator;
                elm.innerHTML = "<div><span></span></div>";
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

                    document.addEventListener("mouseleave", () => { // Hide indicator when leaving the browser content
                        elm.classList.remove(opts.classes.hover);
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
        const isMousePosInPixelTolerance = (pageX, pageY) => {
            let ret = false;
            if (typeof pageX !== "undefined" && pageX !== null) {
                if ((pageX > 0 || pageY > 0) || mouseNotTopLeft) { // protection from unwanted triggers with x = 0 and y = 0 on pageload
                    mouseNotTopLeft = true;
                    const indicator = document.querySelector("#" + opts.ids.indicator);

                    if (indicator) { // indicator is existing
                        let pixelTolerance = getPixelTolerance();
                        if (indicator.classList.contains(opts.classes.visible) && indicator.classList.contains(opts.classes.hover) && opts.config.indicatorWidth > pixelTolerance) { // indicator is visible -> allow click across the indicator width if it is wider then the pixel tolerance
                            pixelTolerance = opts.config.indicatorWidth;
                        }

                        ret = pageX <= pixelTolerance;
                    }
                }
            }

            return ret;
        };

        /**
         * Fires an event to indicate, that the extension is loaded completely
         */
        const extensionLoaded = () => {
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
