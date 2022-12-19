($ => {
    "use strict";

    window.settings = function () {

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        this.opts = {
            classes: {
                saved: "saved",
                restored: "restored"
            },
            attr: {
                i18n: "data-i18n"
            },
            elm: {
                body: $("body"),
                title: $("head > title"),
                rangeInputs: $("input[type='range']"),
                pxToleranceMaximized: $("input#pxToleranceMaximized"),
                pxToleranceWindowed: $("input#pxToleranceWindowed"),
                showIndicator: $("input#showIndicator"),
                openAction: $("select#openAction"),
                closeTab: $("input#closeTab"),
                navigateForward: $("input#navigateForward"),
                save: $("section#control > button.save"),
                restore: $("section#control > button.restore"),
                creationDate: $("section#about > span.created")
            },
            manifest: chrome.runtime.getManifest()
        };


        /**
         * Constructor
         */
        this.run = async () => {
            initLanguage();
            initEvents();
            await initSettings();
        };

        /*
         * ################################
         * PRIVATE
         * ################################
         */

        const initLanguage = () => {
            $("[data-i18n]").forEach((elm) => {
                const val = $(elm).attr(this.opts.attr.i18n);
                $(elm).text(chrome.i18n.getMessage("settings_" + val));
            });

            this.opts.elm.title.text(this.opts.elm.title.text() + " - " + this.opts.manifest.short_name);
        };

        const initEvents = () => {
            this.opts.elm.rangeInputs.on("input change", (e) => {
                $(e.currentTarget).next("span").text(e.currentTarget.value);
            });

            this.opts.elm.save.on("click", async () => {
                await save();
            });

            this.opts.elm.restore.on("click", async () => {
                await restore();
            });
        };

        const initSettings = async () => { // load settings
            const createdDate = +this.opts.elm.creationDate.text();
            const currentYear = new Date().getFullYear();

            if (currentYear > createdDate) {
                this.opts.elm.creationDate.text(createdDate + " - " + currentYear);
            }

            const showIndicator = await chrome.storage.sync.get("showIndicator");
            this.opts.elm.showIndicator[0].checked = typeof showIndicator === "undefined" ? true : (showIndicator === true);

            const closeTab = chrome.storage.sync.get("closeTab");
            this.opts.elm.closeTab[0].checked = typeof closeTab === "undefined" ? false : (closeTab === true);

            const navigateForward = chrome.storage.sync.get("navigateForward");
            this.opts.elm.navigateForward[0].checked = typeof navigateForward === "undefined" ? false : (navigateForward === true);

            const openAction = chrome.storage.sync.get("openAction");
            this.opts.elm.openAction[0].value = typeof openAction === "undefined" ? "mousedown" : openAction;

            const pxTolerance = chrome.storage.sync.get("pxTolerance");
            let pxToleranceObj = {windowed: 20, maximized: 1};

            if (typeof pxTolerance !== "undefined") {
                pxToleranceObj = pxTolerance;
            }

            this.opts.elm.pxToleranceMaximized[0].value = pxToleranceObj.maximized;
            this.opts.elm.pxToleranceWindowed[0].value = pxToleranceObj.windowed;

            this.opts.elm.pxToleranceMaximized.trigger("change");
            this.opts.elm.pxToleranceWindowed.trigger("change");
        };

        const save = async () => { // save settings
            await chrome.storage.sync.set({
                showIndicator: this.opts.elm.showIndicator[0].checked,
                closeTab: this.opts.elm.closeTab[0].checked,
                navigateForward: this.opts.elm.navigateForward[0].checked,
                openAction: this.opts.elm.openAction[0].value,
                pxTolerance: {
                    windowed: this.opts.elm.pxToleranceWindowed[0].value,
                    maximized: this.opts.elm.pxToleranceMaximized[0].value
                }
            });
            this.opts.elm.body.addClass(this.opts.classes.saved);
            await $.delay(1500);
            this.opts.elm.body.removeClass(this.opts.classes.saved);
        };

        const restore = async () => { // restore default settings
            await chrome.storage.sync.remove(["showIndicator", "closeTab", "navigateForward", "pxTolerance", "openAction"]);
            this.opts.elm.body.addClass(this.opts.classes.restored);

            await $.delay(1500);
            this.opts.elm.body.removeClass(this.opts.classes.restored);

            await $.delay(100);
            location.reload();
        };

    };

    new window.settings().run();
})(jsu);