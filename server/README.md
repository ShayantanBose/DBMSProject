# BrowseSync Server

Node.js backend for the BrowseSync browser extension, using MySQL as the database.

## MySQL Table Structure

You will need **3 tables**:

### 1. `users`

- `id` INT PRIMARY KEY AUTO_INCREMENT
- `secret_key` VARCHAR(255) UNIQUE NOT NULL

### 2. `bookmarks`

- `id` INT PRIMARY KEY AUTO_INCREMENT
- `user_id` INT NOT NULL (foreign key to `users.id`)
- `title` VARCHAR(1024)
- `url` VARCHAR(2048)

### 3. `device_bookmarks`

- `user_id` INT PRIMARY KEY (foreign key to `users.id`)
- `tree_json` LONGTEXT (stores the full bookmarks tree as JSON)

## Example SQL

```sql
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

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Edit `index.js` and set your MySQL username and password.
3. Create the database and tables as above.
4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.
