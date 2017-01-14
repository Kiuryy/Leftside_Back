(() => {
    "use strict";

    let opts = {
        ids: {
            main: "devblock-lsb-main",
        },
        classes: {
            visual: "devblock-lsb-add-visual",
            hover: "devblock-lsb-hover"
        },
        events: {
            loaded: "devblock-lsb-loaded"
        },
        config: {
            pxTolerance: {windowed: 20, maximized: 1},
            addVisual: false,
            closeTab: false
        }
    };

    new window.ext(opts).run();
})();