// src/DashboardPage.js

import React from 'react'
import CounterButton from './CounterButton'
import GitHubPRList from './GitHubPRList'
import EditProfileForm from './EditProfileForm'

function DashboardPage({
  user,
  handleLogout,
  userPullRequests,
  userNotes,
  noteDate,
  noteText,
  handleNoteSubmit,
  handleProfileUpdate,
  dispatch,
}) {
  return (
    <div>
      <header className="app-header">
        <h1>Welcome, {user.display_name}!</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CounterButton
            label="Logout"
            onClick={handleLogout}
            className="btn btn-logout"
          />
        </div>
      </header>

      <div className="dashboard-grid">
        {/* --- GitHub PRs Widget --- */}
        <div className="widget-card">
          <GitHubPRList pullRequests={userPullRequests} />
        </div>

        {/* --- Summary Notes Widget --- */}
        <div className="widget-card">
          <h2>📝 Add Summary Note</h2>
          <form onSubmit={handleNoteSubmit}>
            <div className="form-group">
              <label htmlFor="note-date">Date</label>
              <input
                id="note-date"
                type="date"
                value={noteDate}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'noteDate',
                    value: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="note-text">Notes</label>
              <textarea
                id="note-text"
                value={noteText}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'noteText',
                    value: e.target.value,
                  })
                }
                rows="4"
              />
            </div>
            <button type="submit" className="btn">
              Save Note
            </button>
          </form>

          <hr />

          <h3>Submitted Notes</h3>
          {Array.isArray(userNotes) && userNotes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {(Array.isArray(userNotes) ? [...userNotes] : [])
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((note) => (
                  <li
                    key={note.id}
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-background)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.9em',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '500',
                      }}
                    >
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        marginTop: '0.5rem',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {note.note_text}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <EditProfileForm user={user} onSave={handleProfileUpdate} />
      </div>
    </div>
  )
}

export default DashboardPage
