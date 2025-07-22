// src/DashboardPage.js

import React from 'react'
import CounterButton from './CounterButton'
import GitHubPRList from './GitHubPRList'
import EditProfileForm from './EditProfileForm'
import SummaryAggregator from './SummaryAggregator'

function DashboardPage({
  user,
  userList,
  handleLogout,
  userPullRequests,
  userNotes,
  noteDate,
  yesterdayText, // <-- ADD
  todayText, // <-- ADD
  blockersText, // <-- ADD
  learningsText, // <-- ADD
  handleNoteSubmit,
  handleProfileUpdate,
  handleSaveSelection,
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
          <h2>📝 Daily Standup Note</h2>
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
            {/* Yesterday */}
            <div className="form-group">
              <label htmlFor="yesterday-text">
                What did you accomplish yesterday?
              </label>
              <textarea
                id="yesterday-text"
                value={yesterdayText}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'yesterdayText',
                    value: e.target.value,
                  })
                }
                rows="3"
              />
            </div>
            {/* Today */}
            <div className="form-group">
              <label htmlFor="today-text">What are you working on today?</label>
              <textarea
                id="today-text"
                value={todayText}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'todayText',
                    value: e.target.value,
                  })
                }
                rows="3"
              />
            </div>
            {/* Blockers */}
            <div className="form-group">
              <label htmlFor="blockers-text">Do you have any blockers?</label>
              <textarea
                id="blockers-text"
                value={blockersText}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'blockersText',
                    value: e.target.value,
                  })
                }
                rows="2"
              />
            </div>
            {/* Learnings */}
            <div className="form-group">
              <label htmlFor="learnings-text">
                Learnings / Other Notes (optional)
              </label>
              <textarea
                id="learnings-text"
                value={learningsText}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'learningsText',
                    value: e.target.value,
                  })
                }
                rows="2"
              />
            </div>
            <button type="submit" className="btn">
              Save Note
            </button>
          </form>

          <hr />

          <h3>Submitted Notes</h3>
          {userNotes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {userNotes.map((note) => (
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
                      fontSize: '1em',
                      color: 'var(--color-dark)',
                      fontWeight: '700',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {new Date(note.date + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC', // Ensure consistent date formatting
                      }
                    )}
                  </div>
                  {note.yesterday_text && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>
                        Yesterday:
                      </strong>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {note.yesterday_text}
                      </div>
                    </div>
                  )}
                  {note.today_text && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>
                        Today:
                      </strong>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {note.today_text}
                      </div>
                    </div>
                  )}
                  {note.blockers_text && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>
                        Blocker(s):
                      </strong>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {note.blockers_text}
                      </div>
                    </div>
                  )}
                  {note.learnings_text && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>
                        Learning(s):
                      </strong>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {note.learnings_text}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <EditProfileForm user={user} onSave={handleProfileUpdate} />

        <SummaryAggregator
          user={user}
          userList={userList}
          onSaveSelection={handleSaveSelection}
        />
      </div>
    </div>
  )
}

export default DashboardPage
