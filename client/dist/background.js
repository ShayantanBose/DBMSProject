const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let previousBookmarkCount = 0;
let sessionAddedBookmarks = [];
const SESSION_STORAGE_KEY = "browsesync_session_bookmarks";
const FULL_BOOKMARKS_STORAGE_KEY = "browsesync_full_bookmarks";

async function fetchFullBookmarksTree() {
  try {
    const bookmarksTree = await browserAPI.bookmarks.getTree();
    return bookmarksTree;
  } catch (error) {
    console.error("Background: Error fetching full bookmarks tree:", error);
    return null;
  }
}

async function getInitialBookmarkCount() {
  try {
    const bookmarks = await browserAPI.bookmarks.getTree();
    const count = flattenBookmarks(bookmarks).length;
    previousBookmarkCount = count;
    saveFullBookmarksToStorage(bookmarks);
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
  fetchFullBookmarksTree().then(saveFullBookmarksToStorage);
});

browserAPI.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
  previousBookmarkCount--;
  sessionAddedBookmarks = sessionAddedBookmarks.filter(
    (b) => b.id !== id.toString(),
  );
  fetchFullBookmarksTree().then(saveFullBookmarksToStorage);
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestBookmarks") {
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
  } else if (message.action === "saveSessionBookmarks") {
    saveSessionBookmarksToStorage();
  } else if (message.action === "requestFullBookmarks") {
    loadFullBookmarksFromStorage().then((fullBookmarks) => {
      sendResponse({ fullBookmarks });
    });
    return true;
  }
  return true;
});

function saveSessionBookmarksToStorage() {
  const bookmarksToSave = JSON.stringify(sessionAddedBookmarks);
  browserAPI.storage.local.set(
    { [SESSION_STORAGE_KEY]: bookmarksToSave },
    () => {
      console.log("Background: Session bookmarks saved to local storage.");
    },
  );
}

async function loadSessionBookmarksFromStorage() {
  const data = await browserAPI.storage.local.get([SESSION_STORAGE_KEY]);
  if (data && data[SESSION_STORAGE_KEY]) {
    try {
      sessionAddedBookmarks = JSON.parse(data[SESSION_STORAGE_KEY]);
      console.log(
        "Background: Session bookmarks loaded from local storage:",
        sessionAddedBookmarks,
      );
    } catch (error) {
      console.error(
        "Background: Error parsing session bookmarks from storage:",
        error,
      );
    }
  }
}

function saveFullBookmarksToStorage(bookmarksTree) {
  if (bookmarksTree) {
    const fullBookmarksToSave = JSON.stringify(bookmarksTree);
    browserAPI.storage.local.set(
      { [FULL_BOOKMARKS_STORAGE_KEY]: fullBookmarksToSave },
      () => {
        console.log("Background: Full bookmarks tree saved to local storage.");
      },
    );
  }
}

async function loadFullBookmarksFromStorage() {
  const data = await browserAPI.storage.local.get([FULL_BOOKMARKS_STORAGE_KEY]);
  if (data && data[FULL_BOOKMARKS_STORAGE_KEY]) {
    try {
      const fullBookmarks = JSON.parse(data[FULL_BOOKMARKS_STORAGE_KEY]);
      console.log("Background: Full bookmarks tree loaded from local storage.");
      return fullBookmarks;
    } catch (error) {
      console.error(
        "Background: Error parsing full bookmarks tree from storage:",
        error,
      );
      return null;
    }
  }
  return null;
}

loadSessionBookmarksFromStorage();

browserAPI.runtime.onSuspend.addListener(() => {
  console.log(
    "Background: Extension is suspending. Saving session and full bookmarks.",
  );
  saveSessionBookmarksToStorage();
  fetchFullBookmarksTree().then(saveFullBookmarksToStorage);
});
