(() => {
    "use strict";

    let pxToleranceObj = {windowed: 20, maximized: 1};

    let getPixelTolerance = () => {
        let isWindowed = window.screenX !== 0 || window.screenY !== 0 || window.screen.availWidth !== window.innerWidth;
        return pxToleranceObj[isWindowed ? "windowed" : "maximized"];
    };

    chrome.storage.sync.get("pxTolerance", (obj) => {
        if (typeof obj.pxTolerance !== "undefined") {
            if (typeof obj.pxTolerance === "string" && obj.pxTolerance.search(/^\d+$/) === 0) { // backward compatibility
                obj.pxTolerance = "{\"windowed\":20,\"maximized\":" + obj.pxTolerance + "}";
            }
            pxToleranceObj = JSON.parse(obj.pxTolerance);
        }
    });

    document.addEventListener("mousedown", (e) => {
        if (e.pageX < getPixelTolerance() && e.button === 0) { // check mouse position and mouse button
            window.history.back();
        }
    }, {passive: true});

})();
