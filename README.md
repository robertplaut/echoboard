# 🔊 Echostatus – A Team Productivity Dashboard

**GitHub Pages Live Demo: [https://robertplaut.github.io/echostatus/](https://robertplaut.github.io/echostatus/)**
**Request Netlify URL to see AI integrations**

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

---

## 🧪 Feature Walkthrough

### 🧍 Login Screen

Users are shown as avatar cards grouped by team. Clicking a card logs that user in. New users can be created via a dedicated form. The theme can be switched at any time using the toggle in the corner.

### 🐙 GitHub PRs & 📝 Summary Notes

After logging in, the dashboard displays two main widgets. One fetches and displays all pull requests associated with the user's GitHub handle. The other allows the user to submit daily notes, which are saved and displayed in reverse-chronological order.

## 👨‍💻 Contributing

This is an open learning project. Feel free to fork, refactor, or extend it.

---

## 📄 License

MIT — free to use, learn, and remix.
