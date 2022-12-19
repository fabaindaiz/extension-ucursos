"use strict";

// First time launch
chrome.runtime.onInstalled.addListener(function() {
    // Set default settings
    const settings = {
        "my-user": -1,
        "setting-censor-text": true,        // Toggle for censor incivility
        "setting-censor-hate": false,        // Toggle for censor hate speech
        "setting-show-logs": true,
    };

    chrome.storage.local.set({"settings": settings}, function() {
        console.log("Default settings set successfully.");
    });
});
