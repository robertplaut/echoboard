// src/LoginPage.js

import React from 'react'
import { Link } from 'react-router-dom'

// 1. Add `email` to the list of props this component receives
function LoginPage({
  groupedUsers,
  handleQuickLogin,
  handleCreateUser,
  nameInput,
  newTeam,
  newRole,
  githubUsername,
  email, // <-- ADD THIS PROP
  dispatch,
}) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-dark)' }}>
          Welcome to Echoboard
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
          Select a user to begin, or{' '}
          <a href="#create-user-form" style={{ color: 'var(--color-primary)' }}>
            create a new user below
          </a>
          .
        </p>
      </div>

      {/* User Selection Grid (no changes here) */}
      {Object.keys(groupedUsers).length > 0 ? (
        Object.keys(groupedUsers)
          .sort()
          .map((team) => (
            <div key={team} style={{ marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {team}
              </h2>
              <div className="user-card-grid" style={{ marginTop: '1.5rem' }}>
                {groupedUsers[team].map((userObj) => (
                  <Link
                    key={userObj.username}
                    to={`/user/${userObj.username}`}
                    className="user-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <img
                      src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${userObj.username}`}
                      alt={userObj.username}
                      className="avatar-img"
                    />
                    <div className="user-name">{userObj.username}</div>
                    <div className="user-role">{userObj.role}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))
      ) : (
        <p style={{ textAlign: 'center' }}>
          No users found. Please create one to get started.
        </p>
      )}

      <hr />

      {/* New User Creation Form */}
      <div id="create-user-form" className="widget-card">
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label htmlFor="new-username">Username</label>
            <input
              id="new-username"
              type="text"
              placeholder="e.g., jane.doe"
              value={nameInput}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'nameInput',
                  value: e.target.value,
                })
              }
            />
          </div>
          {/* 2. Add the new form group for the Email field */}
          <div className="form-group">
            <label htmlFor="new-email">Email</label>
            <input
              id="new-email"
              type="email" // Using type="email" gives basic browser validation
              placeholder="e.g., jane.doe@example.com"
              value={email}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'email',
                  value: e.target.value,
                })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-team">Team</label>
            <select
              id="new-team"
              value={newTeam}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'newTeam',
                  value: e.target.value,
                })
              }
            >
              <option value="">Select Team...</option>
              <option value="ENGINEERING">ENGINEERING</option>
              <option value="PMO">PMO</option>
              <option value="PRODUCT">PRODUCT</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="new-role">Role</label>
            <select
              id="new-role"
              value={newRole}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'newRole',
                  value: e.target.value,
                })
              }
            >
              <option value="">Select Role...</option>
              <option value="Engineer">Engineer</option>
              <option value="Senior Director of Engineering">
                Senior Director of Engineering
              </option>
              <option value="Senior Product Manager">
                Senior Product Manager
              </option>
              <option value="Program Manager">Program Manager</option>
              <option value="VP of Product">VP of Product</option>
              <option value="VP of PMO">VP of PMO</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="new-github">GitHub Username (optional)</label>
            <input
              id="new-github"
              type="text"
              placeholder="e.g., janedoe-github"
              value={githubUsername}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'githubUsername',
                  value: e.target.value,
                })
              }
            />
          </div>
          <button type="submit" className="btn">
            Create User
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
