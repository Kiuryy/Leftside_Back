(() => {
    "use strict";

    const background = function () {

        this.isDev = false;
        let reinitialized = null;

        const urls = {
            privacy: "https://extensions.redeviation.com/privacy/lsb"
        };

        /**
         * Injects the content scripts to all tabs and therefore runs the extension there again
         */
        const reinitialize = async () => {
            const manifest = chrome.runtime.getManifest();
            reinitialized = +new Date();

            const types = {
                css: "insertCSS",
                js: "executeScript"
            };

            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                if (typeof tab.url === "undefined" || (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://"))) {
                    Object.entries(types).forEach(([type, func]) => {
                        const files = manifest.content_scripts[0][type];

                        for (const file of files) {
                            chrome.tabs[func](tab.id, {file: file}, () => {
                                chrome.runtime.lastError; // do nothing specific with the error -> is thrown if the tab cannot be accessed (like chrome:// urls)
                            });
                        }
                    });
                }
            }
        };

        /**
         * Initialises the eventhandlers
         */
        const initEvents = () => {
            chrome.action.onClicked.addListener(async () => { // click on extension icon shall open the sidebar
                const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "navigateBack",
                    reinitialized: reinitialized
                });
            });
        };

        /**
         * Closes the current tab
         *
         * @returns {Promise}
         */
        const closeTab = () => {
            return new Promise((resolve) => {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.remove(tabs[0].id);
                    resolve();
                });
            });
        };

        /**
         * Initializes the messaging port to the frontend
         */
        const initMessaging = () => {
            const mapping = {
                closeTab: closeTab,
                reinitialize: reinitialize
            };

            chrome.runtime.onMessage.addListener((message, sender, callback) => {
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
            await chrome.contextMenus.removeAll();
            const uid = Math.random().toString(36).substring(2, 14);

            chrome.contextMenus.create({
                id: "lsbPrivacy_" + uid,
                title: "Privacy", // TODO dynamic
                contexts: ["action"]
            });

            chrome.contextMenus.onClicked.addListener(async (obj) => {
                if (obj.menuItemId === "lsbPrivacy_" + uid) {
                    await openURL(urls.privacy, {lang: chrome.i18n.getUILanguage()});
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

            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            await chrome.tabs.create({
                url: url,
                active: true,
                index: tabs[0].index + 1,
                openerTabId: tabs[0].id
            });
        };

        /**
         *
         */
        this.run = async () => {
            const manifest = chrome.runtime.getManifest();
            this.isDev = manifest.version_name === "Dev" || !("update_url" in manifest);
            const start = +new Date();

            initEvents();
            initMessaging();
            await initContextmenus();

            /* eslint-disable no-console */
            if (this.isDev && console && console.info) {
                console.info("Finished loading background script", +new Date() - start);
            }
        };
    };

    new background().run();
})();




