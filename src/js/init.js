(() => {
    "use strict";

    let opts = {
        ids: {
            main: "blockbyte-lsb-main",
        },
        classes: {
            visual: "blockbyte-lsb-add-visual",
            hover: "blockbyte-lsb-hover"
        },
        events: {
            loaded: "blockbyte-lsb-loaded"
        },
        config: {
            pxTolerance: {windowed: 20, maximized: 1},
            addVisual: false,
            closeTab: false
        }
    };

    new window.ext(opts).run();
})();