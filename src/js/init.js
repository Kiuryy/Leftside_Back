(() => {
    "use strict";

    const opts = {
        ids: {
            indicator: "redeviation-lsb-indicator",
        },
        classes: {
            visible: "redeviation-lsb-visible",
            hover: "redeviation-lsb-hover"
        },
        events: {
            loaded: "redeviation-lsb-loaded"
        },
        config: {
            pxTolerance: {windowed: 20, maximized: 1},
            openAction: "mousedown",
            showIndicator: true,
            closeTab: false,
            navigateForward: false,
            indicatorWidth: 24
        }
    };

    new window.ext(opts).run();
})();