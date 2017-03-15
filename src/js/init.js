(() => {
    "use strict";

    let opts = {
        ids: {
            main: "moonware-lsb-main",
        },
        classes: {
            visual: "moonware-lsb-add-visual",
            hover: "moonware-lsb-hover"
        },
        events: {
            loaded: "moonware-lsb-loaded"
        },
        config: {
            pxTolerance: {windowed: 20, maximized: 1},
            addVisual: false,
            closeTab: false
        }
    };

    new window.ext(opts).run();
})();