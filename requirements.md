# Backend API Endpoint Requirements for BrowseSync Extension

This document lists the backend API endpoints required by the frontend React application (browser extension) in the `client` directory.

## 1. User Authentication

### a. Verify User

- **Endpoint:** `/api/verify-user`
- **Method:** POST
- **Request Body:** `{ secretKey: string }`
- **Response:** 200 OK if user exists, 404 if not found, error message otherwise
- **Purpose:** Used to verify if a user with the provided secret key exists.

### b. Create New User

- **Endpoint:** `/api/new-user`
- **Method:** POST
- **Request Body:** `{ secretKey: string }`
- **Response:** 200 OK on success, error message otherwise
- **Purpose:** Used to create a new user with the provided secret key if not found.

## 2. Bookmark Synchronization

### a. Sync Bookmarks (Browser)

- **Endpoint:** `/api/sync-bookmarks`
- **Method:** POST
- **Request Body:**
  - For browser sync: `{ secretKey: string, bookmarks: Array<{ title: string, url: string }>, syncType: "browser" }`
  - For device sync: `{ secretKey: string, fullBookmarksTree: object, syncType: "device" }`
- **Response:** 200 OK on success, error message otherwise
- **Purpose:**
  - Syncs the user's bookmarks from the browser to the backend (browser or device level).

## 3. (Optional/Future) Bookmarks Retrieval

- **Endpoint:** (Not currently used, but may be needed for future features)
- **Purpose:** To fetch bookmarks from the backend to the extension.

---

**Note:** All endpoints expect and return JSON. Authentication is handled via the `secretKey` in the request body.
