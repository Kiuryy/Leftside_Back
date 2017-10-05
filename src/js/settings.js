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
                save: $("button#save"),
                restoreDefaults: $("button#restore"),
                copyright: $("span#copyright")
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

        let initLanguage = () => {
            $("[data-i18n]").forEach((elm) => {
                let val = $(elm).attr(this.opts.attr.i18n);
                $(elm).text(chrome.i18n.getMessage("settings_" + val));
            });

            this.opts.elm.title.text(this.opts.manifest.short_name + " - " + this.opts.elm.title.text());
        };

        let initEvents = () => {
            this.opts.elm.rangeInputs.on("input change", (e) => {
                $(e.currentTarget).next("span").text(e.currentTarget.value);
            });

            this.opts.elm.save.on("click", (e) => { // save settings
                chrome.storage.sync.set({
                    showIndicator: this.opts.elm.showIndicator[0].checked,
                    closeTab: this.opts.elm.closeTab[0].checked,
                    openAction: this.opts.elm.openAction[0].value,
                    pxTolerance: {
                        windowed: this.opts.elm.pxToleranceWindowed[0].value,
                        maximized: this.opts.elm.pxToleranceMaximized[0].value
                    }
                }, () => {
                    this.opts.elm.body.addClass(classes.saved);
                    setTimeout(() => {
                        this.opts.elm.body.removeClass(classes.saved);
                    }, 1500);
                });
            });


            this.opts.elm.restoreDefaults.on("click", () => { // restore default settings
                chrome.storage.sync.remove(["showIndicator", "closeTab", "pxTolerance", "openAction"], () => {
                    this.opts.elm.body.addClass(classes.restored);
                    setTimeout(() => {
                        this.opts.elm.body.removeClass(classes.restored);
                        setTimeout(() => {
                            window.close();
                        }, 100);
                    }, 1500);
                });
            });
        };

        let initSettings = () => { // load settings
            let createdDate = +this.opts.elm.copyright.children("span.created").text();
            let currentYear = new Date().getFullYear();

            if (currentYear > createdDate) {
                this.opts.elm.copyright.children("span.created").text(createdDate + " - " + currentYear);
            }

            chrome.storage.sync.get("showIndicator", (obj) => {
                this.opts.elm.showIndicator[0].checked = typeof obj.showIndicator === "undefined" ? true : (obj.showIndicator === true);
            });

            chrome.storage.sync.get("closeTab", (obj) => {
                this.opts.elm.closeTab[0].checked = typeof obj.closeTab === "undefined" ? false : (obj.closeTab === true);
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

    };

    new window.settings().run();
})(jsu);