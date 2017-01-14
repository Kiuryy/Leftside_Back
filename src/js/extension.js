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
        let domContentLoaded = false;

        /**
         * Initialises the configuration values for the extension
         */
        let initConfig = () => {
            chrome.storage.sync.get(["pxTolerance", "addVisual", "closeTab"], (obj) => {
                if (typeof obj.pxTolerance !== "undefined") {
                    if (typeof obj.pxTolerance === "string" && obj.pxTolerance.search(/^\d+$/) === 0) { // backward compatibility
                        obj.pxTolerance = "{\"windowed\":20,\"maximized\":" + obj.pxTolerance + "}";
                    }
                    opts.config.pxTolerance = JSON.parse(obj.pxTolerance);
                }

                opts.config.addVisual = obj.addVisual !== "n";
                opts.config.closeTab = typeof obj.closeTab !== "undefined" && obj.closeTab !== "n";

                if (domContentLoaded) {
                    document.dispatchEvent(new CustomEvent("DOMContentLoaded"));
                }
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
                if (e.pageX < getPixelTolerance() && e.button === 0) { // check mouse position and mouse button
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


            document.addEventListener("DOMContentLoaded", () => {
                domContentLoaded = true;
                let elm = document.createElement('div');
                elm.id = opts.ids.main;
                document.body.appendChild(elm);

                elm.style.width = getPixelTolerance() + "px";

                if (opts.config.addVisual) { // show arrow on black background
                    elm.classList.add(opts.classes.visual);

                    document.addEventListener("mousemove", (e) => { // check mouse position
                        if (e.pageX < getPixelTolerance()) {
                            elm.classList.add(opts.classes.hover);
                        } else {
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

                extensionLoaded();
            });
        };

        /**
         * Fires an event to indicate, that the extension is loaded completely
         */
        let extensionLoaded = () => {
            document.dispatchEvent(new CustomEvent(opts.events.loaded, {
                detail: {
                    pxTolerance: getPixelTolerance(),
                    addVisual: opts.config.addVisual
                },
                bubbles: true,
                cancelable: false
            }));
        };
    };
})();
