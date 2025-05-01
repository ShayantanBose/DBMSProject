import "../styles/Popup.css";
import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance.js";
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

export default function InitialPopup() {
  const [bookmarkCount, setBookmarkCount] = useState("None");
  const [sessionBookmarks, setSessionBookmarks] = useState([]);
  const [syncingBrowsers, setSyncingBrowsers] = useState(false);
  const [syncingDevices, setSyncingDevices] = useState(false);
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
        }
      }
    );

    return () => {
      browserAPI.runtime.onMessage.removeListener(handleBookmarksUpdated);
    };
  }, []);

  useEffect(() => {
    const fetchSavedBookmarks = async () => {
      try {
        const secretKey = localStorage.getItem("userSecretKey");
        if (!secretKey) return;
        const response = await api.get("/api/bookmarks", {
          params: { secretKey },
        });
        const fetchedBookmarks = response.data.bookmarks;

        const parentId = "1";
        const existingBookmarks = await browserAPI.bookmarks.getChildren(
          parentId
        );

        for (const bm of fetchedBookmarks) {
          if (
            bm.url &&
            !existingBookmarks.some((node) => node.url === bm.url)
          ) {
            await browserAPI.bookmarks.create({
              parentId,
              title: bm.title,
              url: bm.url,
            });
          }
        }

        setBookmarkCount(fetchedBookmarks.length);
      } catch (error) {
        console.error("Error fetching saved bookmarks:", error);
      }
    };

    fetchSavedBookmarks();
  }, []);

  const handleSyncBrowsersClick = async () => {
    setSyncingBrowsers(true);
    setSyncMessage("Syncing bookmarks to this browser...");

    try {
      const secretKey = localStorage.getItem("userSecretKey");
      if (!secretKey) {
        throw new Error("User not authenticated.");
      }

      const browserBookmarksTree = await browserAPI.bookmarks.getTree();
      const browserBookmarks =
        flattenBookmarksForComparison(browserBookmarksTree);

      const bookmarksToSend = {
        secretKey: secretKey,
        bookmarks: browserBookmarks,
        syncType: "browser",
      };

      const response = await api.post("/api/sync-bookmarks", bookmarksToSend);

      setSyncingBrowsers(false);
      setSyncMessage("Bookmarks successfully synced to this browser.");
      alert("Bookmarks successfully synced to this browser.");
    } catch (error) {
      setSyncingBrowsers(false);
      setSyncMessage("Error syncing to this browser. Please try again.");
      alert("Error syncing to this browser. Please try again.");
    }
  };

  const handleSyncDevicesClick = async () => {
    setSyncingDevices(true);
    setSyncMessage("Syncing full bookmark tree to backend...");

    try {
      const secretKey = localStorage.getItem("userSecretKey");
      if (!secretKey) {
        throw new Error("User not authenticated.");
      }
      const browserBookmarksTree = await browserAPI.bookmarks.getTree();
      const bookmarksToSend = {
        secretKey: secretKey,
        fullBookmarksTree: browserBookmarksTree,
        syncType: "device",
      };
      const response = await api.post("/api/sync-bookmarks", bookmarksToSend);

      setSyncingDevices(false);
      setSyncMessage("Full bookmark tree successfully synced to backend.");
      alert("Full bookmark tree successfully synced to backend.");
    } catch (error) {
      setSyncingDevices(false);
      setSyncMessage("Error syncing full bookmark tree. Please try again.");
      alert("Error syncing full bookmark tree. Please try again.");
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
          flattenBookmarksForComparison(node.children)
        );
      }
    });
    return bookmarks;
  };

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
        disabled={syncingBrowsers}
      >
        {syncingBrowsers ? "Syncing..." : "SYNC TO ALL BROWSERS"}
      </button>
      <button
        className="sync-button-devices"
        onClick={handleSyncDevicesClick}
        disabled={syncingDevices}
      >
        {syncingDevices ? "Syncing..." : "SYNC TO ALL DEVICES"}
      </button>
    </>
  );
}
