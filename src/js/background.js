(() => {
    "use strict";

    const background = function () {

        this.isDev = false;

        // eslint-disable-next-line no-undef
        this.ctx = typeof browser === "undefined" ? chrome : browser;

        const urls = {
            privacy: "https://extensions.redeviation.com/privacy/lsb"
        };

        /**
         * Initialises the eventhandlers
         */
        const initEvents = () => {
            this.ctx.action.onClicked.addListener(async () => { // click on extension icon shall navigate back
                const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "navigateBack"
                });
            });
        };

        /**
         * Closes the current tab
         *
         * @returns {Promise}
         */
        const closeTab = async () => {
            const tabs = await this.ctx.tabs.query({active: true, currentWindow: true});
            this.ctx.tabs.remove(tabs[0].id);
        };

        /**
         * Initializes the messaging port to the frontend
         */
        const initMessaging = () => {
            const mapping = {
                closeTab: closeTab
            };

            this.ctx.runtime.onMessage.addListener((message, sender, callback) => {
                if (mapping[message.type]) { // function for message type exists
                    message.tabId = sender.tab ? sender.tab.id : null;
                    mapping[message.type](message).then((result) => {
                        callback(result);
                    })["catch"]((error) => {
                        console.error(error);
                        callback();
                    });
                } else {
                    console.error("Unknown message type:", message.type);
                    callback();
                }
                return true;
            });
        };

        /**
         *
         * @returns {Promise}
         */
        const initContextmenus = async () => {
            await this.ctx.contextMenus.removeAll();
            const uid = Math.random().toString(36).substring(2, 14);

            this.ctx.contextMenus.create({
                id: "lsbPrivacy_" + uid,
                title: "Privacy", // TODO dynamic
                contexts: ["action"]
            });

            this.ctx.contextMenus.create({
                id: "lsbSettings_" + uid,
                title: "Settings", // TODO dynamic
                contexts: ["action"]
            });

            this.ctx.contextMenus.onClicked.addListener(async (obj) => {
                if (obj.menuItemId === "lsbPrivacy_" + uid) {
                    await openURL(urls.privacy, {lang: this.ctx.i18n.getUILanguage()});
                } else if (obj.menuItemId === "lsbSettings_" + uid) {
                    await openURL(this.ctx.runtime.getURL("html/settings.html"), {});
                }
            });
        };

        /**
         * Opens the given URL in a new tab and appends the given parameters to the URL
         *
         * @param {string} url
         * @param {object} params
         */
        const openURL = async (url, params) => {
            if (params) {
                url += "?" + Object.entries(params).map(([key, val]) => {
                    return encodeURIComponent(key) + "=" + val;
                }).join("&");
            }

            const tabs = await this.ctx.tabs.query({active: true, currentWindow: true});
            await this.ctx.tabs.create({
                url: url,
                active: true,
                index: tabs[0].index + 1,
                openerTabId: tabs[0].id
            });
        };

        /**
         *  Workaround to keep service worker alive.
         *  This prevents the new tab override to fail or flicker due to slow wake up of the service worker
         *  https://stackoverflow.com/a/66618269/1660305
         */
        const keepalive = () => {
            const onMessage = (msg, port) => {
                // eslint-disable-next-line no-console
                console.log("keepalive message: ", msg, port.sender);
            };

            const deleteTimer = (port) => {
                if (port._timer) {
                    clearTimeout(port._timer);
                    delete port._timer;
                }
            };

            const forceReconnect = (port) => {
                deleteTimer(port);
                port.disconnect();
            };

            this.ctx.runtime.onConnect.addListener((port) => {
                if (port.name !== "keepalive") {
                    return;
                }
                port.onMessage.addListener(onMessage);
                port.onDisconnect.addListener(deleteTimer);
                // force reconnect after 250s. After 300s the browser would terminate the connection by itself
                port._timer = setTimeout(forceReconnect, 250 * 100, port);
            });
        };

        /**
         *
         */
        this.run = async () => {
            const manifest = this.ctx.runtime.getManifest();
            this.isDev = manifest.version_name === "Dev" || !("update_url" in manifest);
            const start = +new Date();

            initEvents();
            initMessaging();
            keepalive();
            await initContextmenus();

            /* eslint-disable no-console */
            if (this.isDev && console && console.info) {
                console.info("Finished loading background script", +new Date() - start);
            }
        };
    };

    new background().run();
})();




