// src/GitHubPRList.js

// 1. Import useState to manage which PRs are expanded
import React, { useState } from "react";

const GitHubPRList = ({ user, pullRequests }) => {
  // 2. State to track the IDs of expanded PRs
  const [expandedPRs, setExpandedPRs] = useState({});

  // 3. Function to toggle the expanded state for a single PR
  const toggleDetails = (prId) => {
    setExpandedPRs((prev) => ({
      ...prev,
      [prId]: !prev[prId], // Set the PR's expanded state to the opposite of what it was
    }));
  };

  if (!pullRequests || pullRequests.length === 0) {
    return (
      <div>
        <div className="widget-header">
          <h2 style={{ display: "flex", alignItems: "center" }}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 97.6 96"
              width="20"
              height="20"
              fill="currentColor"
              style={{ marginRight: "0.75rem" }}
            >
              <path d="M48.9,0C21.8,0,0,22,0,49.2C0,71,14,89.4,33.4,95.9c2.4,0.5,3.3-1.1,3.3-2.4c0-1.1-0.1-5.1-0.1-9.1 c-13.6,2.9-16.4-5.9-16.4-5.9c-2.2-5.7-5.4-7.2-5.4-7.2c-4.4-3,0.3-3,0.3-3c4.9,0.3,7.5,5.1,7.5,5.1c4.4,7.5,11.4,5.4,14.2,4.1 c0.4-3.2,1.7-5.4,3.1-6.6c-10.8-1.1-22.2-5.4-22.2-24.3c0-5.4,1.9-9.8,5-13.2c-0.5-1.2-2.2-6.3,0.5-13c0,0,4.1-1.3,13.4,5.1 c3.9-1.1,8.1-1.6,12.2-1.6s8.3,0.6,12.2,1.6c9.3-6.4,13.4-5.1,13.4-5.1c2.7,6.8,1,11.8,0.5,13c3.2,3.4,5,7.8,5,13.2 c0,18.9-11.4,23.1-22.3,24.3c1.8,1.5,3.3,4.5,3.3,9.1c0,6.6-0.1,11.9-0.1,13.5c0,1.3,0.9,2.9,3.3,2.4C83.6,89.4,97.6,71,97.6,49.2 C97.7,22,75.8,0,48.9,0z" />
            </svg>
            GitHub Pull Requests
            {user.github_username && ` - ${user.github_username}`}
          </h2>
        </div>
        <p>No pull requests found for this user.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="widget-header">
        <h2 style={{ display: "flex", alignItems: "center" }}>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 97.6 96"
            width="20"
            height="20"
            fill="currentColor"
            style={{ marginRight: "0.75rem" }}
          >
            <path d="M48.9,0C21.8,0,0,22,0,49.2C0,71,14,89.4,33.4,95.9c2.4,0.5,3.3-1.1,3.3-2.4c0-1.1-0.1-5.1-0.1-9.1 c-13.6,2.9-16.4-5.9-16.4-5.9c-2.2-5.7-5.4-7.2-5.4-7.2c-4.4-3,0.3-3,0.3-3c4.9,0.3,7.5,5.1,7.5,5.1c4.4,7.5,11.4,5.4,14.2,4.1 c0.4-3.2,1.7-5.4,3.1-6.6c-10.8-1.1-22.2-5.4-22.2-24.3c0-5.4,1.9-9.8,5-13.2c-0.5-1.2-2.2-6.3,0.5-13c0,0,4.1-1.3,13.4,5.1 c3.9-1.1,8.1-1.6,12.2-1.6s8.3,0.6,12.2,1.6c9.3-6.4,13.4-5.1,13.4-5.1c2.7,6.8,1,11.8,0.5,13c3.2,3.4,5,7.8,5,13.2 c0,18.9-11.4,23.1-22.3,24.3c1.8,1.5,3.3,4.5,3.3,9.1c0,6.6-0.1,11.9-0.1,13.5c0,1.3,0.9,2.9,3.3,2.4C83.6,89.4,97.6,71,97.6,49.2 C97.7,22,75.8,0,48.9,0z" />
          </svg>
          GitHub Pull Requests
          {user.github_username && ` - ${user.github_username}`}
        </h2>
      </div>
      <div className="widget-scroll-container">
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pullRequests.map((pr) => {
            // Check if the current PR is expanded
            const isExpanded = !!expandedPRs[pr.id];

            return (
              <li
                key={pr.id}
                style={{
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  {/* 4. Add the author's GitHub avatar */}
                  <img
                    src={pr.user.avatar_url}
                    alt={pr.user.login}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <div>
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-primary)",
                        textDecoration: "none",
                        fontSize: "1.1rem",
                      }}
                    >
                      #{pr.number}: {pr.title}
                    </a>
                    {/* 5. Add author's username and the PR creation date */}
                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      by <strong>{pr.user.login}</strong> on{" "}
                      {new Date(pr.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.9em",
                    color: "var(--color-text-secondary)",
                    marginLeft: "42px",
                  }}
                >
                  Status:{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    {pr.state}
                  </strong>{" "}
                  | Merged: {pr.merged_at ? "✅ Yes" : "❌ No"}
                  {/* 6. The Toggle Button */}
                  <button
                    onClick={() => toggleDetails(pr.id)}
                    style={{
                      marginLeft: "1rem",
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      padding: "0",
                      fontSize: "0.9em",
                    }}
                  >
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {/* 7. Conditionally render the PR body (description) */}
                {isExpanded && (
                  <div
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      padding: "1rem",
                      marginTop: "1rem",
                      marginLeft: "42px",
                    }}
                  >
                    {/* Using <pre> preserves line breaks and spacing from the description */}
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {pr.body || "No description provided."}
                    </pre>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default GitHubPRList;
