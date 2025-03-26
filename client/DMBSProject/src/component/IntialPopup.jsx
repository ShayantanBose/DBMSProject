import "../styles/Popup.css";
import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance.js";
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

export default function InitialPopup() {
  const [bookmarkCount, setBookmarkCount] = useState("None");
  const [sessionBookmarks, setSessionBookmarks] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

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

  const handleSyncBrowsersClick = async () => {
    console.log("Syncing bookmarks to this browser (from backend)...");
    setSyncing(true);
    setSyncMessage("Fetching bookmarks from server...");

    try {
      // backend endpoint
      const response = await api.get("/api/bookmarks-to-sync");
      const backendBookmarks = response.data;
      setSyncMessage("Comparing bookmarks...");

      browserAPI.bookmarks.getTree(async (browserBookmarksTree) => {
        const browserBookmarks =
          flattenBookmarksForComparison(browserBookmarksTree);

        const bookmarksToAdd = backendBookmarks.filter(
          (backendBookmark) =>
            !browserBookmarks.some(
              (browserBookmark) =>
                browserBookmark.title === backendBookmark.title &&
                browserBookmark.url === backendBookmark.url,
            ),
        );

        setSyncMessage(`Adding ${bookmarksToAdd.length} new bookmarks...`);
        console.log("Bookmarks to add to browser:", bookmarksToAdd);

        for (const bookmark of bookmarksToAdd) {
          try {
            await browserAPI.bookmarks.create({
              title: bookmark.title,
              url: bookmark.url,
            });
            console.log(`Added bookmark: ${bookmark.title}`);
          } catch (error) {
            console.error(`Error adding bookmark ${bookmark.title}:`, error);
          }
        }

        setSyncing(false);
        setSyncMessage(
          `Successfully added ${bookmarksToAdd.length} new bookmarks to this browser.`,
        );
        alert(
          `Successfully added ${bookmarksToAdd.length} new bookmarks to this browser.`,
        );
      });
    } catch (error) {
      console.error("Error fetching or syncing bookmarks from backend:", error);
      setSyncing(false);
      setSyncMessage("Error syncing bookmarks. Please try again.");
      alert("Error syncing bookmarks. Please try again.");
    }
  };

  const flattenBookmarksForComparison = (bookmarkNodes) => {
    let bookmarks = [];
    bookmarkNodes.forEach((node) => {
      if (node.url) {
        bookmarks.push({ title: node.title, url: node.url });
      }
      if (node.children) {
        bookmarks = bookmarks.concat(
          flattenBookmarksForComparison(node.children),
        );
      }
    });
    return bookmarks;
  };

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

      <button
        className="sync-button-browsers"
        onClick={handleSyncBrowsersClick}
        disabled={syncing}
      >
        {syncing ? "Syncing..." : "SYNC TO ALL BROWSERS"}
      </button>
      <button className="sync-button-devices" disabled={syncing}>
        SYNC TO ALL DEVICES
      </button>
      {syncMessage && <p className="sync-message">{syncMessage}</p>}
    </>
  );
}
