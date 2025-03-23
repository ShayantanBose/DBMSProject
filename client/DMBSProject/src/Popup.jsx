import { useState, useEffect } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function Popup() {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [sessionBookmarks, setSessionBookmarks] = useState([]);

  useEffect(() => {
    browserAPI.runtime.sendMessage(
      { action: "requestBookmarks" },
      (response) => {
        console.log("popup received response", response);
        if (response && response.count) {
          setBookmarkCount(response.count);
        }
        if (response && response.sessionAdded) {
          setSessionBookmarks(response.sessionAdded);
        }
      },
    );

    const listener = (message) => {
      if (message.action === "bookmarksUpdated") {
        setBookmarkCount(message.count);
        setSessionBookmarks(message.sessionAdded);
        console.log("popup received new bookmarks", message.sessionAdded);
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
      {sessionBookmarks.length > 0 && (
        <div>
          <h3>Session Added Bookmarks:</h3>
          <ul>
            {sessionBookmarks.map((bookmark) => (
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
