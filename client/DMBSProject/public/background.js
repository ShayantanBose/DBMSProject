const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let previousBookmarks = [];
let previousBookmarkCount = 0;
let sessionAddedBookmarks = [];

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

async function checkBookmarks() {
  const currentBookmarks = await fetchBookmarks();
  const currentBookmarkCount = currentBookmarks.length;

  if (currentBookmarkCount !== previousBookmarkCount) {
    console.log("Bookmark count changed!");

    const newBookmarks = currentBookmarks.filter(
      (bookmark) => !previousBookmarks.some((prev) => prev.id === bookmark.id),
    );

    const removedBookmarks = previousBookmarks.filter(
      (bookmark) => !currentBookmarks.some((curr) => curr.id === bookmark.id),
    );

    previousBookmarks = currentBookmarks;
    previousBookmarkCount = currentBookmarkCount;

    sessionAddedBookmarks = sessionAddedBookmarks.concat(newBookmarks);

    sessionAddedBookmarks = sessionAddedBookmarks.filter(
      (bookmark) =>
        !removedBookmarks.some((removed) => removed.id === bookmark.id),
    );

    browserAPI.runtime.sendMessage({
      action: "bookmarksUpdated",
      count: currentBookmarkCount,
      sessionAdded: sessionAddedBookmarks,
    });
  }
}

fetchBookmarks().then((bookmarks) => {
  previousBookmarks = bookmarks;
  previousBookmarkCount = bookmarks.length;
  setInterval(checkBookmarks, 5000); // Check every 5 seconds
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestBookmarks") {
    sendResponse({
      count: previousBookmarkCount,
      sessionAdded: sessionAddedBookmarks,
    });
  } else if (message.action === "bookmarksUpdated") {
    try {
      checkBookmarks();
    } catch (e) {
      console.error("error in checkBookmarks", e);
    }
  }
  return true;
});
