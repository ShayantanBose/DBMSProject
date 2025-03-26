import "../styles/Popup.css";
import React, { useState, useEffect } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

export default function InitialPopup() {
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
    <>
      <div className="box">
        <p className="title">TOTAL BOOKMARKS</p>
        <p className="count">{bookmarkCount}</p>
      </div>

      <div className="box">
        <p className="title">NEWLY ADDED</p>
        <ul>
          {sessionBookmarks.length > 0 ? (
            sessionBookmarks.map((bookmark) => (
              <li className="bookmarks-added" key={bookmark.id}>
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
