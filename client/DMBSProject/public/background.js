const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabInfo") {
    browserAPI.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs.length > 0) {
          try {
            sendResponse({ title: tabs[0].title, url: tabs[0].url });
          } catch (e) {
            console.error("sendResponse error", e);
          }
        } else {
          try {
            sendResponse({ error: "No active tab found" });
          } catch (e) {
            console.error("sendResponse error", e);
          }
        }
      })
      .catch((error) => {
        try {
          sendResponse({ error: error.message });
        } catch (e) {
          console.error("sendResponse error", e);
        }
      });
    return true;
  }
});

if (browserAPI.action) {
  browserAPI.action.onClicked.addListener((tab) => {
    console.log("Browser action clicked on tab:", tab);
  });
}
