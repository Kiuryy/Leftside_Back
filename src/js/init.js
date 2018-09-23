(() => {
    "use strict";

    const opts = {
        ids: {
            indicator: "blockbyte-lsb-indicator",
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
            openAction: "mousedown",
            showIndicator: true,
            closeTab: false,
            navigateForward: false,
            indicatorWidth: 40
        }
    };

    new window.ext(opts).run();
})();