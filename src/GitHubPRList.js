// src/GitHubPRList.js

import React from 'react'

const GitHubPRList = ({ pullRequests }) => {
  // Return null if there are no PRs to show, keeps the UI clean
  if (!pullRequests || pullRequests.length === 0) {
    return (
      <div>
        <h2>GitHub Pull Requests</h2>
        <p>No pull requests found for this user.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>GitHub Pull Requests</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {pullRequests.map((pr) => (
          <li
            key={pr.id}
            style={{
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)',
              // Add this line to fix the text color
              color: 'var(--color-text-primary)',
            }}
          >
            <a
              href={pr.html_url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontWeight: 'bold',
                // Make the link color theme-aware as well
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              #{pr.number}: {pr.title}
            </a>
            <div
              style={{
                fontSize: '0.9em',
                marginTop: '0.25rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Status: <strong>{pr.state}</strong> | Merged:{' '}
              {pr.merged_at ? '✅ Yes' : '❌ No'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GitHubPRList
