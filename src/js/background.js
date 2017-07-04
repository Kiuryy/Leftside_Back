(() => {
    "use strict";

    let installationDate = +new Date();

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
        chrome.storage.sync.get(["installationDate"], (obj) => {
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
     *
     */
    (() => {
        initModel();
    })();

})();




