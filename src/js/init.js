(() => {
    "use strict";

    let opts = {
        ids: {
            main: "blockbyte-lsb-main",
        },
        classes: {
            visible: "blockbyte-lsb-visible",
            hover: "blockbyte-lsb-hover"
        },
        events: {
            loaded: "blockbyte-lsb-loaded"
        },
        config: {
            pxTolerance: {windowed: 20, maximized: 1},
            showIndicator: true,
            closeTab: false
        }
    };

    new window.ext(opts).run();
})();