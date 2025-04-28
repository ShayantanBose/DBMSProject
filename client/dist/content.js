console.log("Content script loaded!");
browser.runtime.sendMessage({ action: "contentScriptLoaded" });
