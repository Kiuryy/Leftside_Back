(() => {
    "use strict";

    window.ext = function (opts) {

        let mouseNotTopLeft = false;

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        /**
         * Constructor
         */
        this.run = () => {
            initConfig();
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
         * Initialises the eventhandlers
         */
        let initEvents = () => {
            document.addEventListener(opts.config.openAction, (e) => {
                if (e.isTrusted && (opts.config.openAction !== "mousedown" || e.button === 0) && isMousePosInPixelTolerance(e.pageX, e.pageY)) { // check mouse position and mouse button
                    e.stopPropagation();
                    e.preventDefault();

                    let useFallback = true;
                    window.onbeforeunload = window.onpopstate = () => {
                        useFallback = false
                    };

                    window.history.back();

                    setTimeout(() => {
                        if (opts.config.closeTab && useFallback) {
                            chrome.extension.sendMessage({type: "closeTab"});
                        }
                    }, 200);
                }
            });

            document.addEventListener("DOMContentLoaded", () => {
                initIndicator();
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
