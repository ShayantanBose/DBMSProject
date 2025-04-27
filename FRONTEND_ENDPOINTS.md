# Frontend API Endpoints

This document lists all backend API endpoints that the frontend interacts with.

## POST /api/verify-user

- **Description:** Verify if a user with the given secret key exists.
- **Request Body:**
  - `secretKey` (string)

## POST /api/new-user

- **Description:** Create a new user account with a secret key.
- **Request Body:**
  - `secretKey` (string)

## POST /api/sync-bookmarks

- **Description:** Sync bookmarks from client to backend.
- **Request Body:**
  - `secretKey` (string)
  - `bookmarks` (array of `{ title: string, url: string }`) — used when `syncType` is `"browser"`
  - `fullBookmarksTree` (array of bookmark nodes) — used when `syncType` is `"device"`
  - `syncType` (string) — either `"browser"` or `"device"`
