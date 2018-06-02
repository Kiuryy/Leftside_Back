($ => {
    "use strict";

    let background = function () {

        this.isDev = false;
        let reinitialized = null;

        /**
         * Injects the content scripts to all tabs and because of this runs the extension there again
         */
        let reinitialize = () => {
            return new Promise((resolve) => {
                let manifest = chrome.runtime.getManifest();
                reinitialized = +new Date();

                let types = {
                    css: "insertCSS",
                    js: "executeScript"
                };

                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        if (typeof tab.url === "undefined" || (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://"))) {
                            Object.entries(types).forEach(([type, func]) => {
                                let files = manifest.content_scripts[0][type];

                                files.forEach((file) => {
                                    chrome.tabs[func](tab.id, {file: file}, function () {
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
        let initEvents = async () => {
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
        let closeTab = () => {
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
        let initPort = async () => {
            let mapping = {
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
         */
        this.run = () => {
            let manifest = chrome.runtime.getManifest();
            this.isDev = manifest.version_name === "Dev" || !("update_url" in manifest);
            let start = +new Date();

            Promise.all([
                initEvents(),
                initPort()
            ]).then(() => {
                if (this.isDev && console && console.log) {
                    console.log("Finished loading background script", +new Date() - start);
                }
            });
        };
    };

    new background().run();
})(jsu);




