# BrowseSync: Browser Bookmark Synchronization

BrowseSync is a browser extension that allows you to synchronize your bookmarks across different browsers and devices using a MySQL backend for persistent storage.

## Project Overview

BrowseSync helps users manage their bookmarks and keep them synchronized across various browsers and devices. It features a secret-key based authentication method and provides a view of recently added bookmarks.

### Features

- **Secure authentication** using a secret key
- **Track newly added bookmarks** during the current session
- **Sync bookmarks** across different browsers
- **Sync full bookmark trees** across different devices
- **Persistent storage** using MySQL database

## Architecture

### Client (Browser Extension)

- Built with **React** and **Vite**
- Uses browser extension APIs to interact with bookmarks
- Components:
  - Authentication flow (login/create account)
  - Bookmark listing and synchronization UI

### Server (Backend)

- Built with **Node.js** and **Express**
- Uses **MySQL** for database storage
- Provides RESTful API endpoints for:
  - User authentication
  - Bookmark synchronization

## Database Structure

The MySQL database consists of three tables:

1. **`users`**

   - `id` INT PRIMARY KEY AUTO_INCREMENT
   - `secret_key` VARCHAR(255) UNIQUE NOT NULL

2. **`bookmarks`**

   - `id` INT PRIMARY KEY AUTO_INCREMENT
   - `user_id` INT NOT NULL (foreign key to `users.id`)
   - `title` VARCHAR(1024)
   - `url` VARCHAR(2048)

3. **`device_bookmarks`**
   - `user_id` INT PRIMARY KEY (foreign key to `users.id`)
   - `tree_json` LONGTEXT (stores the full bookmarks tree as JSON)

## Setup Instructions

### Prerequisites

- Node.js and npm
- MySQL server
- Web browser that supports extensions (Chrome, Firefox, etc.)

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the MySQL connection in `index.js`:

   ```javascript
   const pool = mysql.createPool({
     host: "localhost",
     user: "your_mysql_username",
     password: "your_mysql_password",
     database: "bookmarkSync",
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
   });
   ```

4. Create the database and tables:

   ```sql
   CREATE DATABASE bookmarkSync;
   USE bookmarkSync;

   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     secret_key VARCHAR(255) UNIQUE NOT NULL
   );

   CREATE TABLE bookmarks (
     id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT NOT NULL,
     title VARCHAR(1024),
     url VARCHAR(2048),
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );

   CREATE TABLE device_bookmarks (
     user_id INT PRIMARY KEY,
     tree_json LONGTEXT,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

5. Start the server:
   ```bash
   npm start
   ```
   The server will run on http://localhost:3001 by default.

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load the extension in your browser:
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `dist` folder
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file from the `dist` folder

## Usage

1. Click on the BrowseSync extension icon in your browser toolbar
2. Create a new account with a secret key or login with an existing one
3. View your bookmarks count and newly added bookmarks
4. Use the sync buttons to synchronize:
   - **SYNC TO ALL BROWSERS**: Syncs individual bookmarks across browsers
   - **SYNC TO ALL DEVICES**: Syncs the full bookmark tree structure across devices
5. Use the same secret key on different browsers/devices to access your synchronized bookmarks

## API Endpoints

- **POST /api/verify-user**: Verifies if a user exists with the provided secret key
- **POST /api/new-user**: Creates a new user with the provided secret key
- **POST /api/sync-bookmarks**: Syncs bookmarks (browser level) or full bookmark tree (device level)

## Extension Permissions

- **storage**: For storing user data and bookmarks locally
- **tabs**: For interacting with browser tabs
- **bookmarks**: For accessing and modifying the browser's bookmarks

## Development

- Start the development server for the client:

  ```bash
  cd client
  npm run dev
  ```

- Make changes to the server or client code as needed
- Rebuild the extension after making changes:
  ```bash
  cd client
  npm run build
  ```

## Technology Stack

- **Frontend**: React, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Build Tools**: Vite, ESLint

## Future Enhancements

- Add folder structure synchronization
- Implement bookmark searching and filtering
- Add multi-user support for team collaboration
- Implement bookmark tagging and categorization
