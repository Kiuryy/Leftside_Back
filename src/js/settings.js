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
        this.run = () => {
            initLanguage();
            initEvents();
            initSettings();
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

            this.opts.elm.save.on("click", () => {
                save();
            });

            this.opts.elm.restore.on("click", () => {
                restore();
            });
        };

        const initSettings = () => { // load settings
            const createdDate = +this.opts.elm.creationDate.text();
            const currentYear = new Date().getFullYear();

            if (currentYear > createdDate) {
                this.opts.elm.creationDate.text(createdDate + " - " + currentYear);
            }

            chrome.storage.sync.get("showIndicator", (obj) => {
                this.opts.elm.showIndicator[0].checked = typeof obj.showIndicator === "undefined" ? true : (obj.showIndicator === true);
            });

            chrome.storage.sync.get("closeTab", (obj) => {
                this.opts.elm.closeTab[0].checked = typeof obj.closeTab === "undefined" ? false : (obj.closeTab === true);
            });

            chrome.storage.sync.get("navigateForward", (obj) => {
                this.opts.elm.navigateForward[0].checked = typeof obj.navigateForward === "undefined" ? false : (obj.navigateForward === true);
            });

            chrome.storage.sync.get("openAction", (obj) => {
                this.opts.elm.openAction[0].value = typeof obj.openAction === "undefined" ? "mousedown" : obj.openAction;
            });

            chrome.storage.sync.get("pxTolerance", (obj) => {
                let pxToleranceObj = {windowed: 20, maximized: 1};

                if (typeof obj.pxTolerance !== "undefined") {
                    pxToleranceObj = obj.pxTolerance;
                }

                this.opts.elm.pxToleranceMaximized[0].value = pxToleranceObj.maximized;
                this.opts.elm.pxToleranceWindowed[0].value = pxToleranceObj.windowed;

                this.opts.elm.pxToleranceMaximized.trigger("change");
                this.opts.elm.pxToleranceWindowed.trigger("change");
            });
        };

        const save = () => { // save settings
            chrome.storage.sync.set({
                showIndicator: this.opts.elm.showIndicator[0].checked,
                closeTab: this.opts.elm.closeTab[0].checked,
                navigateForward: this.opts.elm.navigateForward[0].checked,
                openAction: this.opts.elm.openAction[0].value,
                pxTolerance: {
                    windowed: this.opts.elm.pxToleranceWindowed[0].value,
                    maximized: this.opts.elm.pxToleranceMaximized[0].value
                }
            }, () => {
                this.opts.elm.body.addClass(this.opts.classes.saved);
                $.delay(1500).then(() => {
                    this.opts.elm.body.removeClass(this.opts.classes.saved);
                });
            });
        };

        const restore = () => { // restore default settings
            chrome.storage.sync.remove(["showIndicator", "closeTab", "navigateForward", "pxTolerance", "openAction"], () => {
                this.opts.elm.body.addClass(this.opts.classes.restored);
                $.delay(1500).then(() => {
                    this.opts.elm.body.removeClass(this.opts.classes.restored);
                    $.delay(100).then(() => {
                        location.reload();
                    });
                });
            });
        };

    };

    new window.settings().run();
})(jsu);