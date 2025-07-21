# 🔊 Echostatus – A Team Productivity Dashboard

**Live Demo: [https://robertplaut.github.io/echostatus/](https://robertplaut.github.io/echostatus/)**

A responsive, single-page React application that provides a lightweight dashboard for team members to view their GitHub pull requests and log daily summary notes. All data is stored and synced via [Supabase](https://supabase.com).

---

## 📋 Product Overview

| Key Feature                | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| 🌓 **Light/Dark Mode**     | Toggle between light and dark themes for user viewing comfort.             |
| 🔐 **Team-Based Login**    | Users select their name from an avatar card grid, grouped by team.         |
| ➕ **New User Creation**   | New users can be added with a team, role, and optional GitHub handle.      |
| 🐙 **GitHub Integration**  | Lists a user's open and merged pull requests from the project repo.        |
| 📝 **Timestamped Notes**   | Users can log daily notes, which are stored and displayed chronologically. |
| 🌩 **Real-Time Cloud Sync** | All data is stored in Supabase (PostgreSQL) and reflects in real time.     |

---

## 🛠 Tech Stack

| Layer            | Tool                                                    |
| ---------------- | ------------------------------------------------------- |
| Frontend         | React (CRA)                                             |
| State Management | React `useReducer` for centralized state logic          |
| Cloud Storage    | Supabase (PostgreSQL + REST API)                        |
| Styling          | CSS & Inline CSS-in-JS (with CSS Variables for Theming) |
| Avatar Generator | DiceBear Avatars (URL-based API)                        |
| External APIs    | GitHub REST API (for public pull request data)          |

---

## 🔧 Setup Instructions

1.  **Clone this repo**:

    ```bash
    git clone https://github.com/robertplaut/echostatus.git
    cd echostatus
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
        github_username TEXT,
        email TEXT
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

4.  **Configure Environment Variables**:

    - In the root directory of your project, create a file named `.env`.
    - Add your Supabase URL and anonymous key to this file. The `REACT_APP_` prefix is required.
      ```
      REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
      REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```
    - The `supabaseClient.js` file is already configured to read these variables.

5.  **Start the app**:
    ```bash
    npm start
    ```
    _(You must restart the server after creating or modifying the `.env` file)_

---

## 🧪 Feature Walkthrough

### 🧍 Login Screen

Users are shown as avatar cards grouped by team. Clicking a card logs that user in. New users can be created via a dedicated form. The theme can be switched at any time using the toggle in the corner.

### 🐙 GitHub PRs & 📝 Summary Notes

After logging in, the dashboard displays two main widgets. One fetches and displays all pull requests associated with the user's GitHub handle. The other allows the user to submit daily notes, which are saved and displayed in reverse-chronological order.

---

## 📦 Folder Structure

```text
echostatus/
├── public/
│   └── index.html         # Main HTML template, title, meta tags
├── src/
│   ├── App.js             # Main app logic and state
│   ├── App.css            # Global styling
│   ├── CounterButton.js
│   ├── githubApi.js       # Logic for fetching from GitHub API
│   ├── GitHubPRList.js    # Component to display PRs
│   ├── supabaseClient.js  # Supabase configuration
│   ├── ThemeToggle.js     # The dark/light mode toggle component
│   └── useTheme.js        # The custom hook for theme logic
├── package.json
└── README.md
```

---

## 🚀 Possible Future Features

- 🔑 Authentication via Okta
- 🔑 Supabase with Row Level Security.
- 🗑️ Note editing and deleting functionality.
- 📈 Team-level dashboards and aggregated stats.
- 🤖 AI-powered daily email summaries for team leads.
- ✅ CI workflow that runs tests and auto-deploys on merge to main.

---

## 👨‍💻 Contributing

This is an open learning project. Feel free to fork, refactor, or extend it.

---

## 📄 License

MIT — free to use, learn, and remix.
