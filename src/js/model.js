(() => {
    "use strict";

    let installationDate = +new Date();
    let xhrUrls = {
        userdata: "https://moonware.de/ajax/extensions/userdata"
    };

    /**
     * Closes the current tab
     *
     * @param {object} opts
     * @param {function} sendResponse
     */
    let closeTab = (opts, sendResponse) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.remove(tabs[0].id);
        });
    };


    let mapping = {
        closeTab: closeTab
    };

    /**
     * Message listener
     */
    chrome.extension.onMessage.addListener((message, sender, sendResponse) => {
        if (mapping[message.type]) { // function for message type exists
            mapping[message.type](message, sendResponse);
        }

        return true; // important to allow asynchronous responses
    });


    /**
     * Initialises the model
     */
    let initModel = () => {
        chrome.storage.sync.get(["uuid", "installationDate"], (obj) => {
            if (typeof obj.uuid === "undefined") { // no uuid yet -> set new one
                chrome.storage.sync.set({
                    uuid: (() => {
                        let d = +new Date();
                        if (window.performance && typeof window.performance.now === "function") {
                            d += window.performance.now(); //use high-precision timer if available
                        }
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                            let r = (d + Math.random() * 16) % 16 | 0;
                            d = Math.floor(d / 16);
                            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                        });
                    })()
                });
            }

            if (typeof obj.installationDate === "undefined") { // no date yet -> save a start date in storage
                installationDate = +new Date();

                chrome.storage.sync.set({
                    installationDate: installationDate
                });
            } else {
                installationDate = obj.installationDate;
            }
        });
    };


    /**
     * Shares the userdata if user allowed so
     */
    let shareUserdata = () => {
        chrome.storage.sync.get(null, (obj) => {
            if (typeof obj.uuid !== "undefined" && (typeof obj.lastShareDate === "undefined" || (+new Date() - obj.lastShareDate) / 36e5 > 12)) { // uuid is available and last time of sharing is over 12 hours ago
                chrome.storage.sync.set({
                    lastShareDate: +new Date()
                });

                let sendXhr = (obj) => {
                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", xhrUrls.userdata, true);
                    let data = new FormData();
                    data.append('data', JSON.stringify(obj));
                    xhr.send(data);
                };

                let manifest = chrome.runtime.getManifest();

                if (manifest.version_name === "Dev" || !('update_url' in manifest)) {
                    obj.uuid = "Dev";
                }

                obj.extension = {
                    name: manifest.name,
                    version: manifest.version
                };

                if (typeof obj.shareUserdata !== "undefined" && obj.shareUserdata === "y") { // share userdata
                    delete obj.lastShareDate;
                    obj.lang = chrome.i18n.getUILanguage();
                    obj.ua = navigator.userAgent;
                    sendXhr(obj);
                } else { // do not share userdata -> only share extension infos
                    sendXhr({
                        uuid: obj.uuid,
                        extension: obj.extension,
                        shareUserdata: typeof obj.shareUserdata === "undefined" ? "undefined" : obj.shareUserdata
                    });
                }
            }
        });
    };


    /**
     *
     */
    (() => {
        initModel();
        shareUserdata();
    })();

})();




