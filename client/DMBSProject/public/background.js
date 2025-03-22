const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let previousBookmarks = [];

async function fetchBookmarks() {
  try {
    const bookmarks = await browserAPI.bookmarks.getTree();
    return flattenBookmarks(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

function flattenBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  bookmarkTreeNodes.forEach((node) => {
    if (node.url) {
      bookmarks.push({ id: node.id, title: node.title, url: node.url });
    }
    if (node.children) {
      bookmarks = bookmarks.concat(flattenBookmarks(node.children));
    }
  });
  return bookmarks;
}

async function checkBookmarks() {
  const currentBookmarks = await fetchBookmarks();
  if (JSON.stringify(currentBookmarks) !== JSON.stringify(previousBookmarks)) {
    console.log("Bookmarks changed!");
    previousBookmarks = currentBookmarks;
    browserAPI.runtime.sendMessage({
      action: "bookmarksUpdated",
      bookmarks: currentBookmarks,
    });
  }
}

fetchBookmarks().then((bookmarks) => {
  previousBookmarks = bookmarks;
  setInterval(checkBookmarks, 5000); // Check every 5 seconds
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestBookmarks") {
    sendResponse({ bookmarks: previousBookmarks });
  }
});
