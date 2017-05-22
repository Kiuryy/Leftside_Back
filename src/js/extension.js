(() => {
    "use strict";

    window.ext = function (opts) {

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
            initEvents();
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
            let configFields = ["pxTolerance", "showIndicator", "closeTab"];
            chrome.storage.sync.get(configFields, (obj) => {
                configFields.forEach((field) => {
                    if (typeof obj[field] !== "undefined") {
                        opts.config[field] = obj[field];
                    }
                });

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
            return opts.config.pxTolerance[isWindowed ? "windowed" : "maximized"];
        };

        /**
         * Initialises the eventhandlers
         */
        let initEvents = () => {

            document.addEventListener("mousedown", (e) => {
                let pixelTolerance = getPixelTolerance();
                let indicator = document.querySelector("#" + opts.ids.indicator);

                if (indicator.classList.contains(opts.classes.visible) && indicator.classList.contains(opts.classes.hover) && pixelTolerance < opts.config.indicatorWidth) { // indicator is visible -> allow click across the indicator width if it is wider then the pixel tolerance
                    pixelTolerance = opts.config.indicatorWidth;
                }

                if (e.pageX < pixelTolerance && e.button === 0) { // check mouse position and mouse button
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
            }, {passive: true});
        };

        let initIndicator = () => {
            let elm = document.createElement('div');
            elm.id = opts.ids.indicator;
            document.body.appendChild(elm);

            elm.style.width = getPixelTolerance() + "px";

            if (opts.config.showIndicator) { // show arrow on black background
                elm.classList.add(opts.classes.visible);

                document.addEventListener("mousemove", (e) => { // check mouse position
                    if (e.pageX < getPixelTolerance()) {
                        elm.classList.add(opts.classes.hover);
                    } else if (typeof e.pageX === "undefined" || e.pageX > opts.config.indicatorWidth) {
                        elm.classList.remove(opts.classes.hover);
                    }
                }, {passive: true});

                document.addEventListener("visibilitychange", () => {
                    if (document.hidden) {
                        elm.classList.remove(opts.classes.hover);
                    }
                });

                window.addEventListener("resize", () => {
                    elm.style.width = getPixelTolerance() + "px";
                }, {passive: true});
            }

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
