// src/GitHubPRList.js

// 1. Import useState to manage which PRs are expanded
import React, { useState } from "react";

const GitHubPRList = ({ pullRequests }) => {
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
        <h2>GitHub Pull Requests</h2>
        <p>No pull requests found for this user.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>GitHub Pull Requests</h2>
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
