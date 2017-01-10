(() => {
    "use strict";

    let pxToleranceObj = {windowed: 20, maximized: 1};

    let getPixelTolerance = () => {
        let isWindowed = window.screenX !== 0 || window.screenY !== 0 || window.screen.availWidth !== window.innerWidth;
        return pxToleranceObj[isWindowed ? "windowed" : "maximized"];
    };

    let elm = document.createElement('div');
    elm.id = "devblock-lsb-main";
    document.body.appendChild(elm);

    chrome.storage.sync.get(["pxTolerance", "addVisual"], (obj) => {
        if (typeof obj.pxTolerance !== "undefined") {
            if (typeof obj.pxTolerance === "string" && obj.pxTolerance.search(/^\d+$/) === 0) { // backward compatibility
                obj.pxTolerance = "{\"windowed\":20,\"maximized\":" + obj.pxTolerance + "}";
            }
            pxToleranceObj = JSON.parse(obj.pxTolerance);
        }

        let addVisual = obj.addVisual !== "n";
        elm.style.width = getPixelTolerance() + "px";

        if (addVisual) { // show arrow on black background
            elm.classList.add("devblock-lsb-add-visual");

            document.addEventListener("mousemove", (e) => { // check mouse position
                if (e.pageX < getPixelTolerance()) {
                    elm.classList.add("devblock-lsb-hover");
                } else {
                    elm.classList.remove("devblock-lsb-hover");
                }
            }, {passive: true});
        }

        document.dispatchEvent(new CustomEvent("devblock-lsb-loaded", {
            detail: {
                pxTolerance: getPixelTolerance(),
                addVisual: addVisual
            },
            bubbles: true,
            cancelable: false
        }));
    });

    window.addEventListener("resize", () => {
        elm.style.width = getPixelTolerance() + "px";
    }, {passive: true});

    document.addEventListener("visibilitychange", (e) => {
        if (document.hidden) {
            elm.classList.remove("devblock-lsb-hover");
        }
    });
})();