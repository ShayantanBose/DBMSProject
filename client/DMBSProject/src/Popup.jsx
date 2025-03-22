import { useState, useEffect } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function Popup() {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [newBookmarks, setNewBookmarks] = useState([]);

  useEffect(() => {
    browserAPI.runtime.sendMessage(
      { action: "requestBookmarkCount" },
      (response) => {
        if (response && response.count) {
          setBookmarkCount(response.count);
        }
      },
    );

    const listener = (message) => {
      if (message.action === "bookmarksUpdated") {
        setBookmarkCount(message.count);
        setNewBookmarks(message.newBookmarks);
      }
    };

    browserAPI.runtime.onMessage.addListener(listener);

    return () => {
      browserAPI.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div>
      <h2>Bookmarks</h2>
      <p>Total Bookmarks: {bookmarkCount}</p>
      {newBookmarks.length > 0 && (
        <div>
          <h3>New Bookmarks:</h3>
          <ul>
            {newBookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Popup;
