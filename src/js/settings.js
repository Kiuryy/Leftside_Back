/**
 *
 * @param {jsu} $
 */
($ => {
    "use strict";

    let classes = {
        saved: "saved",
        restored: "restored"
    };

    let elm = {
        body: $("body"),
        title: $("head > title"),
        rangeInputs: $("input[type='range']"),
        pxToleranceMaximized: $("input#pxToleranceMaximized"),
        pxToleranceWindowed: $("input#pxToleranceWindowed"),
        showIndicator: $("input#showIndicator"),
        openAction: $("select#openAction"),
        closeTab: $("input#closeTab"),
        save: $("button#save"),
        restoreDefaults: $("button#restore"),
        copyright: $("span#copyright")
    };

    let initLanguage = () => {
        $("[data-i18n]").forEach((elm) => {
            let val = $(elm).attr("data-i18n");
            $(elm).text(chrome.i18n.getMessage("settings_" + val));
        });

        let manifest = chrome.runtime.getManifest();
        elm.title.text(manifest.short_name + " - " + elm.title.text());
    };

    let initSettings = () => { // load settings
        let createdDate = +elm.copyright.children("span.created").text();
        let currentYear = new Date().getFullYear();

        if (currentYear > createdDate) {
            elm.copyright.children("span.created").text(createdDate + " - " + currentYear);
        }

        chrome.storage.sync.get("showIndicator", (obj) => {
            elm.showIndicator[0].checked = typeof obj.showIndicator === "undefined" ? true : (obj.showIndicator === true);
        });

        chrome.storage.sync.get("closeTab", (obj) => {
            elm.closeTab[0].checked = typeof obj.closeTab === "undefined" ? false : (obj.closeTab === true);
        });

        chrome.storage.sync.get("openAction", (obj) => {
            elm.openAction[0].value = typeof obj.openAction === "undefined" ? "mousedown" : obj.openAction;
        });

        chrome.storage.sync.get("pxTolerance", (obj) => {
            let pxToleranceObj = {windowed: 20, maximized: 1};

            if (typeof obj.pxTolerance !== "undefined") {
                pxToleranceObj = obj.pxTolerance;
            }

            elm.pxToleranceMaximized[0].value = pxToleranceObj.maximized;
            elm.pxToleranceWindowed[0].value = pxToleranceObj.windowed;

            elm.pxToleranceMaximized.trigger("change");
            elm.pxToleranceWindowed.trigger("change");
        });
    };

    elm.rangeInputs.on("input change", (e) => {
        $(e.currentTarget).next("span").text(e.currentTarget.value);
    });

    elm.save.on("click", (e) => { // save settings
        chrome.storage.sync.set({
            showIndicator: elm.showIndicator[0].checked,
            closeTab: elm.closeTab[0].checked,
            openAction: elm.openAction[0].value,
            pxTolerance: {
                windowed: elm.pxToleranceWindowed[0].value,
                maximized: elm.pxToleranceMaximized[0].value
            }
        }, () => {
            elm.body.addClass(classes.saved);
            setTimeout(() => {
                elm.body.removeClass(classes.saved);
            }, 1500);
        });
    });


    elm.restoreDefaults.on("click", () => { // restore default settings
        chrome.storage.sync.remove(["showIndicator", "closeTab", "pxTolerance"], () => {
            elm.body.addClass(classes.restored);
            setTimeout(() => {
                elm.body.removeClass(classes.restored);
                setTimeout(() => {
                    window.close();
                }, 100);
            }, 1500);
        });
    });

    initLanguage();
    initSettings();

})(jsu);
