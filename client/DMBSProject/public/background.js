const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let previousBookmarks = [];
let previousBookmarkCount = 0;

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
  const currentBookmarkCount = currentBookmarks.length;

  if (currentBookmarkCount !== previousBookmarkCount) {
    console.log("Bookmark count changed!");
    const newBookmarks = currentBookmarks.filter(
      (bookmark) => !previousBookmarks.some((prev) => prev.id === bookmark.id),
    );

    previousBookmarks = currentBookmarks;
    previousBookmarkCount = currentBookmarkCount;

    browserAPI.runtime.sendMessage({
      action: "bookmarksUpdated",
      count: currentBookmarkCount,
      newBookmarks: newBookmarks,
    });
  }
}

fetchBookmarks().then((bookmarks) => {
  previousBookmarks = bookmarks;
  previousBookmarkCount = bookmarks.length;
  setInterval(checkBookmarks, 5000);
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestBookmarkCount") {
    sendResponse({ count: previousBookmarkCount });
  } else if (message.action === "bookmarksUpdated") {
    try {
      checkBookmarks();
    } catch (e) {
      console.error("error in checkBookmarks", e);
    }
  }
  return true;
});
