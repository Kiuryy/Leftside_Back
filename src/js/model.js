(() => {
    "use strict";

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


})();




