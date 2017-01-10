/**
 *
 * @param {jsu} $
 */
($ => {
    "use strict";

    let elm = {
        pxToleranceMaximized: $("input#pxToleranceMaximized"),
        pxToleranceWindowed: $("input#pxToleranceWindowed"),
        addVisual: $("input#addVisual"),
        save: $("button#save"),
        copyright: $("span#copyright")
    };

    let initLanguage = () => {
        $("[data-i18n]").forEach((elm) => {
            let val = $(elm).attr("data-i18n");
            $(elm).text(chrome.i18n.getMessage("settings_" + val));
        });
    };

    let initSettings = () => { // load settings
        let manifest = chrome.runtime.getManifest();
        $("head > title").text(manifest.short_name + " - " + $("head > title").text());

        let createdDate = +elm.copyright.children("span.created").text();
        let currentYear = new Date().getFullYear();

        if (currentYear > createdDate) {
            elm.copyright.children("span.created").text(createdDate + " - " + currentYear);
        }

        chrome.storage.sync.get("addVisual", (obj) => {
            elm.addVisual[0].checked = typeof obj.addVisual === "undefined" ? true : (obj.addVisual === "y");
        });

        chrome.storage.sync.get("pxTolerance", (obj) => {
            let pxToleranceObj = {windowed: 20, maximized: 1};

            if (typeof obj.pxTolerance !== "undefined") {
                pxToleranceObj = JSON.parse(obj.pxTolerance);
            }

            elm.pxToleranceMaximized[0].value = pxToleranceObj.maximized;
            elm.pxToleranceWindowed[0].value = pxToleranceObj.windowed;

            elm.pxToleranceMaximized.trigger("change");
            elm.pxToleranceWindowed.trigger("change");
        });
    };

    $("input[type='range']").on("input change", (e) => {
        $(e.currentTarget).next("span").text(e.currentTarget.value);
    });

    elm.save.on("click", (e) => { // save settings
        chrome.storage.sync.set({
            addVisual: elm.addVisual[0].checked ? "y" : "n",
            pxTolerance: JSON.stringify({
                windowed: elm.pxToleranceWindowed[0].value,
                maximized: elm.pxToleranceMaximized[0].value
            })
        }, () => {
            $("body").addClass("saved");
            setTimeout(() => {
                $("body").removeClass("saved");
            }, 1500);
        });
    });

    initLanguage();
    initSettings();

})(jsu);
