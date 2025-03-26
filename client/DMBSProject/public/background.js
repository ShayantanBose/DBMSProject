const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let previousBookmarkCount = 0;
let sessionAddedBookmarks = [];

async function getInitialBookmarkCount() {
  try {
    const bookmarks = await browserAPI.bookmarks.getTree();
    const count = flattenBookmarks(bookmarks).length;
    console.log("Background: Initial bookmark count fetched:", count);
    previousBookmarkCount = count;
    return count;
  } catch (error) {
    console.error("Background: Error fetching initial bookmark count:", error);
    return 0;
  }
}

function flattenBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  bookmarkTreeNodes.forEach((node) => {
    if (node.url) {
      bookmarks.push({
        id: node.id,
        title: node.title,
        url: node.url,
        dateAdded: node.dateAdded,
      });
    }
    if (node.children) {
      bookmarks = bookmarks.concat(flattenBookmarks(node.children));
    }
  });
  return bookmarks;
}

getInitialBookmarkCount();

browserAPI.bookmarks.onCreated.addListener(async (id, bookmark) => {
  previousBookmarkCount++;
  sessionAddedBookmarks.push(bookmark);
  console.log("Background: Bookmark added:", bookmark);
});

browserAPI.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
  previousBookmarkCount--;
  sessionAddedBookmarks = sessionAddedBookmarks.filter(
    (b) => b.id !== id.toString(),
  );
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestBookmarks") {
    console.log("Background: Received requestBookmarks. Sending data.");
    sendResponse({
      count: previousBookmarkCount,
      sessionAdded: sessionAddedBookmarks,
    });
  } else if (message.action === "clearSessionBookmarks") {
    sessionAddedBookmarks = [];
    sendResponse({
      count: previousBookmarkCount,
      sessionAdded: sessionAddedBookmarks,
    });
  }
  return true;
});
