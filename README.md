# 🔊 Echo Board – A Team Productivity Dashboard

**Live Demo: [https://robertplaut.github.io/echoboard/](https://robertplaut.github.io/echoboard/)**

A responsive, single-page React application that provides a lightweight dashboard for team members to track personal interaction counts, view their GitHub pull requests, and log daily summary notes. All data is stored and synced via [Supabase](https://supabase.com).

---

## 📋 Product Overview

| Key Feature                | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| 🔐 **Team-Based Login**    | Users select their name from an avatar card grid, grouped by team.         |
| ➕ **New User Creation**   | New users can be added with a team, role, and optional GitHub handle.      |
| 📊 **Per-User Counter**    | Each user has their own independent counter saved to the cloud.            |
| 🐙 **GitHub Integration**  | Lists a user's open and merged pull requests from the project repo.        |
| 📝 **Timestamped Notes**   | Users can log daily notes, which are stored and displayed chronologically. |
| 👁️ **User Dashboard**      | A table displays all usernames and their counters for an admin-style view. |
| 🌩 **Real-Time Cloud Sync** | All data is stored in Supabase (PostgreSQL) and reflects in real time.     |

---

## 🛠 Tech Stack

| Layer            | Tool                                           |
| ---------------- | ---------------------------------------------- |
| Frontend         | React (CRA)                                    |
| State Management | React `useReducer` for centralized state logic |
| Cloud Storage    | Supabase (PostgreSQL + REST API)               |
| Styling          | Plain CSS & Inline CSS-in-JS                   |
| Avatar Generator | DiceBear Avatars (URL-based API)               |
| External APIs    | GitHub REST API (for public pull request data) |

---

## 🔧 Setup Instructions

1.  **Clone this repo**:

    ```bash
    git clone https://github.com/robertplaut/echoboard.git
    cd echoboard
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up Supabase**:

    - Create a free project at [https://supabase.com](https://supabase.com).
    - In the SQL Editor, create the `users` and `notes` tables:

      ```sql
      -- Create the users table
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT UNIQUE NOT NULL,
        counter INT DEFAULT 0,
        team TEXT,
        role TEXT,
        github_username TEXT
      );

      -- Create the notes table
      CREATE TABLE notes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        note_text TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        date DATE
      );
      ```

    - Disable Row-Level Security (RLS) for development if desired.

4.  **Configure API**:
    Create a file `src/supabaseClient.js` and add your project URL and anon key:

    ```js
    import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    export default supabase
    ```

5.  **Start the app**:
    ```bash
    npm start
    ```

---

## 🧪 Feature Walkthrough

### 🧍 Login Screen

Users are shown as avatar cards grouped by team. Clicking a card logs that user in. New users can be created via the form, which prevents duplicate usernames.

### 🧮 Counter & Dashboard

The main view shows a counter for the logged-in user. `+1` and `Reset` buttons update the counter, and changes are written to Supabase and reflected immediately in the admin dashboard table at the bottom of the page.

### 🐙 GitHub PRs & 📝 Summary Notes

If a GitHub username is provided for a user, the dashboard fetches and displays all pull requests associated with that user from the main repository. Additionally, a user can submit daily notes with a date and text, which are saved and displayed in reverse-chronological order.

---

## 📦 Folder Structure

````

echoboard/
├── public/
│ └── index.html # Main HTML template, title, meta tags
├── src/
│ ├── App.js # Main app logic and state
│ ├── App.css # Global styling
│ ├── CounterButton.js
│ ├── CounterDisplay.js
│ ├── githubApi.js # Logic for fetching from GitHub API
│ ├── GitHubPRList.js # Component to display PRs
│ ├── supabaseClient.js # Supabase configuration
│ └── UserManager.js # Component for the all-users table
├── package.json
└── README.md

```

---

## 🚀 Possible Future Features

-   🔑 Authentication via Supabase (email/password or GitHub OAuth)
-   🗑️ Note editing and deleting functionality
-   📈 Team-level dashboards and aggregated stats
-   ✅ CI workflow that runs tests and auto-deploys on merge to main

---

## 👨‍💻 Contributing

This is an open learning project. Feel free to fork, refactor, or extend it.

---

## 📄 License

MIT — free to use, learn, and remix.
