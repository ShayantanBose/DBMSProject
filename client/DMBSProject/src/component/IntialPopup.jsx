import "../styles/Popup.css";
import React, { useState, useEffect } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

export default function InitialPopup() {
  const [bookmarkCount, setBookmarkCount] = useState("None");
  const [sessionBookmarks, setSessionBookmarks] = useState([]);

  useEffect(() => {
    const handleBookmarksUpdated = (message) => {
      if (message.action === "bookmarksUpdated") {
        setBookmarkCount(message.count);
        setSessionBookmarks(message.sessionAdded);
      }
    };

    browserAPI.runtime.onMessage.addListener(handleBookmarksUpdated);

    browserAPI.runtime.sendMessage(
      { action: "requestBookmarks" },
      (response) => {
        if (response) {
          setBookmarkCount(response.count);
          setSessionBookmarks(response.sessionAdded);
        } else {
          console.log(
            "InitialPopup: No response received for requestBookmarks",
          );
        }
      },
    );

    return () => {
      browserAPI.runtime.onMessage.removeListener(handleBookmarksUpdated);
    };
  }, []);

  console.log(
    "InitialPopup Rendering - bookmarkCount:",
    bookmarkCount,
    "sessionBookmarks:",
    sessionBookmarks,
  );

  return (
    <>
      <div className="box">
        <p className="title">TOTAL BOOKMARKS</p>
        <p className="count">{bookmarkCount}</p>
      </div>

      <div className="box">
        <p className="title">NEWLY ADDED</p>
        <ul>
          {sessionBookmarks && sessionBookmarks.length > 0 ? (
            sessionBookmarks.map((bookmark) => (
              <li className="bookmarks-added" key={bookmark.id}>
                {console.log("InitialPopup Rendering - Bookmark:", bookmark)}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.title}
                </a>
              </li>
            ))
          ) : (
            <li>No new bookmarks</li>
          )}
        </ul>
      </div>

      <button className="sync-button-browsers">SYNC TO ALL BROWSERS</button>
      <button className="sync-button-devices">SYNC TO ALL DEVICES</button>
    </>
  );
}
