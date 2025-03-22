import { useState, useEffect } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function Popup() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    browserAPI.runtime.sendMessage(
      { action: "requestBookmarks" },
      (response) => {
        if (response && response.bookmarks) {
          setBookmarks(response.bookmarks);
        }
      },
    );

    const listener = (message) => {
      if (message.action === "bookmarksUpdated" && message.bookmarks) {
        setBookmarks(message.bookmarks);
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
      <ul>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id}>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
              {bookmark.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Popup;
