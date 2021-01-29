($ => {
    "use strict";

    const background = function () {

        this.isDev = false;
        let reinitialized = null;

        const urls = {
            privacy: "https://extensions.redeviation.com/privacy/lsb"
        };

        /**
         * Injects the content scripts to all tabs and because of this runs the extension there again
         */
        const reinitialize = () => {
            return new Promise((resolve) => {
                const manifest = chrome.runtime.getManifest();
                reinitialized = +new Date();

                const types = {
                    css: "insertCSS",
                    js: "executeScript"
                };

                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        if (typeof tab.url === "undefined" || (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://"))) {
                            Object.entries(types).forEach(([type, func]) => {
                                const files = manifest.content_scripts[0][type];

                                files.forEach((file) => {
                                    chrome.tabs[func](tab.id, {file: file}, () => {
                                        chrome.runtime.lastError; // do nothing specific with the error -> is thrown if the tab cannot be accessed (like chrome:// urls)
                                    });
                                });
                            });
                        }
                    });

                    resolve();
                });
            });
        };

        /**
         * Initialises the eventhandlers
         *
         * @returns {Promise}
         */
        const initEvents = async () => {
            chrome.browserAction.onClicked.addListener(() => { // click on extension icon shall open the sidebar
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "navigateBack",
                        reinitialized: reinitialized

                    });
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
         *
         * @returns {Promise}
         */
        const initPort = async () => {
            const mapping = {
                closeTab: closeTab,
                reinitialize: reinitialize
            };

            chrome.runtime.onConnect.addListener((port) => {
                if (port.name && port.name === "background") {
                    port.onMessage.addListener((message, info) => {
                        if (mapping[message.type]) { // function for message type exists
                            message.tabInfo = info.sender.tab;
                            mapping[message.type](message).then((result) => {
                                try { // can fail if port is closed in the meantime
                                    port.postMessage({
                                        uid: message.uid,
                                        result: result
                                    });
                                } catch (e) {
                                    //
                                }
                            });
                        }
                    });
                }
            });
        };

        /**
         *
         * @returns {Promise}
         */
        const initContextmenus = () => {
            return new Promise((resolve) => {
                chrome.contextMenus.removeAll(() => {
                    const uid = Math.random().toString(36).substr(2, 12);

                    chrome.contextMenus.create({
                        id: "lsbPrivacy_" + uid,
                        title: "Privacy", // @toDo dynamic
                        contexts: ["browser_action"]
                    });

                    chrome.contextMenus.onClicked.addListener((obj) => {
                        if (obj.menuItemId === "lsbPrivacy_" + uid) {
                            openURL(urls.privacy, {lang: chrome.i18n.getUILanguage()});
                        }
                    });

                    resolve();
                });
            });
        };

        /**
         * Opens the given URL in a new tab and appends the given parameters to the URL
         *
         * @param {string} url
         * @param {object} params
         */
        const openURL = (url, params) => {
            if (params) {
                url += "?" + Object.entries(params).map(([key, val]) => {
                    return encodeURIComponent(key) + "=" + val;
                }).join("&");
            }

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.create({
                    url: url,
                    active: true,
                    index: tabs[0].index + 1,
                    openerTabId: tabs[0].id
                });
            });
        };

        /**
         *
         */
        this.run = () => {
            const manifest = chrome.runtime.getManifest();
            this.isDev = manifest.version_name === "Dev" || !("update_url" in manifest);
            const start = +new Date();

            Promise.all([
                initEvents(),
                initContextmenus(),
                initPort()
            ]).then(() => {
                /* eslint-disable no-console */
                if (this.isDev && console && console.info) {
                    console.info("Finished loading background script", +new Date() - start);
                }
            });
        };
    };

    new background().run();
})(jsu);




