($ => {
    "use strict";

    window.settings = function () {

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        // eslint-disable-next-line no-undef
        this.ctx = typeof browser === "undefined" ? chrome : browser;

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
            manifest: this.ctx.runtime.getManifest()
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
                const variableName = $(elm).attr(this.opts.attr.i18n);
                $(elm).text(this.ctx.i18n.getMessage(variableName));
            });

            this.opts.elm.title.text(this.opts.elm.title.text() + " - " + this.opts.manifest.name);
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

            const opts = await this.ctx.storage.sync.get([
                "showIndicator",
                "closeTab",
                "navigateForward",
                "openAction",
                "pxTolerance"
            ]);

            this.opts.elm.showIndicator[0].checked = typeof opts.showIndicator === "undefined" ? true : (opts.showIndicator === true);
            this.opts.elm.closeTab[0].checked = typeof opts.closeTab === "undefined" ? false : (opts.closeTab === true);
            this.opts.elm.navigateForward[0].checked = typeof opts.navigateForward === "undefined" ? false : (opts.navigateForward === true);
            this.opts.elm.openAction[0].value = typeof opts.openAction === "undefined" ? "mousedown" : opts.openAction;

            let pxToleranceObj = {windowed: 20, maximized: 5};
            if (typeof opts.pxTolerance !== "undefined") {
                pxToleranceObj = opts.pxTolerance;
            }

            this.opts.elm.pxToleranceMaximized[0].value = pxToleranceObj.maximized;
            this.opts.elm.pxToleranceWindowed[0].value = pxToleranceObj.windowed;

            this.opts.elm.pxToleranceMaximized.trigger("change");
            this.opts.elm.pxToleranceWindowed.trigger("change");
        };

        const save = async () => { // save settings
            await this.ctx.storage.sync.set({
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
            await this.ctx.storage.sync.remove(["showIndicator", "closeTab", "navigateForward", "pxTolerance", "openAction"]);
            this.opts.elm.body.addClass(this.opts.classes.restored);

            await $.delay(1500);
            this.opts.elm.body.removeClass(this.opts.classes.restored);

            await $.delay(100);
            location.reload();
        };

    };

    new window.settings().run();
})(jsu);