// src/App.js

import React, { useEffect, useReducer } from 'react'
import CounterButton from './CounterButton'
import CounterDisplay from './CounterDisplay'
import UserManager from './UserManager'
import supabase from './supabaseClient'
import { fetchPullRequests } from './githubApi'
import GitHubPRList from './GitHubPRList'
import ThemeToggle from './ThemeToggle'
import './App.css'

const GITHUB_OWNER = 'robertplaut'
const GITHUB_REPO = 'echoboard'

// 2. Define initial state object
const initialState = {
  user: null,
  userList: [],
  count: 0,
  showCounter: true,
  flash: false,
  refreshKey: 0,
  nameInput: '',
  newTeam: '',
  newRole: '',
  githubUsername: '',
  userPullRequests: [],
  noteDate: new Date().toISOString().split('T')[0],
  noteText: '',
  userNotes: [],
}

// 3. Define a reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      }

    case 'CREATE_USER_SUCCESS':
      return {
        ...state,
        nameInput: '',
        newTeam: '',
        newRole: '',
        githubUsername: '',
        userList: [...state.userList, action.payload],
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        count: action.payload.counter || 0,
      }

    case 'SET_NOTES':
      return {
        ...state,
        userNotes: action.payload,
      }

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        count: 0,
        userNotes: [],
        userPullRequests: [],
      }

    case 'SET_COUNT':
      return {
        ...state,
        count: action.payload,
      }

    case 'SET_FLASH':
      return {
        ...state,
        flash: action.payload,
      }

    case 'INCREMENT_REFRESH_KEY':
      return {
        ...state,
        refreshKey: state.refreshKey + 1,
      }

    case 'SET_USER_LIST':
      return {
        ...state,
        userList: action.payload,
      }

    case 'SET_PULL_REQUESTS':
      return {
        ...state,
        userPullRequests: action.payload,
      }

    case 'TOGGLE_COUNTER':
      return {
        ...state,
        showCounter: !state.showCounter,
      }

    case 'SUBMIT_NOTE_SUCCESS':
      return {
        ...state,
        noteText: '', // Clear the textarea
        noteDate: new Date().toISOString().split('T')[0], // Reset date to today
        userNotes: action.payload, // Update the notes list with the fresh data
      }

    default:
      return state
  }
}

function App() {
  // 4. Initialize state with useReducer
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    user,
    userList,
    count,
    showCounter,
    flash,
    refreshKey,
    nameInput,
    newTeam,
    newRole,
    githubUsername,
    userPullRequests,
    noteDate,
    noteText,
    userNotes,
  } = state

  // --- REMOVE OLD useState hooks ---
  // const [user, setUser] = useState(null);
  // const [nameInput, setNameInput] = useState("");
  // const [count, setCount] = useState(0);
  // const [showCounter, setShowCounter] = useState(true);
  // const [flash, setFlash] = useState(false);
  // const [refreshKey, setRefreshKey] = useState(0);
  // const [userList, setUserList] = useState([]);
  // const [newTeam, setNewTeam] = useState("");
  // const [newRole, setNewRole] = useState("");
  // const [githubUsername, setGithubUsername] = useState("");
  // const [userPullRequests, setUserPullRequests] = useState([]);
  // const [noteDate, setNoteDate] = useState(() => {
  //   return new Date().toISOString().split("T")[0];
  // });
  // const [noteText, setNoteText] = useState("");
  // const [userNotes, setUserNotes] = useState([]);
  // ------------------------------------

  const handleQuickLogin = async (username) => {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !userData) {
      alert('Error logging in')
      return
    }

    // START of code to UPDATE
    // Dispatch the action to log the user in and set their counter
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData })

    // Fetch notes for the logged-in user...
    const notes = await fetchNotesForUser(userData.id)

    // ...and dispatch an action to set them in the state
    dispatch({ type: 'SET_NOTES', payload: notes })
    // END of code to UPDATE
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    const newUsername = nameInput.trim()

    if (!newUsername) {
      alert('Please enter a username.')
      return
    }

    if (!newTeam) {
      alert('Please select a team.')
      return
    }

    if (!newRole) {
      alert('Please select a role.')
      return
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', newUsername)
      .single()

    if (existingUser) {
      alert('Username already exists. Choose another.')
      return
    }

    const newUser = {
      username: newUsername,
      counter: 0,
      team: newTeam,
      role: newRole,
      github_username: githubUsername || null,
    }

    const { error } = await supabase.from('users').insert([newUser])

    if (error) {
      alert('Error creating user.')
      console.error('Insert error:', error) // It's good practice to log the error
      return
    }

    dispatch({ type: 'CREATE_USER_SUCCESS', payload: newUser })
  }

  // 🔁 Logout
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  // UI logic
  const increment = async () => {
    const newCount = count + 1
    dispatch({ type: 'SET_COUNT', payload: newCount })

    if (user) {
      // Note: We're not using .eq("username", user) anymore,
      // because our user object from state is the full user record.
      await supabase
        .from('users')
        .update({ counter: newCount })
        .eq('id', user.id) // Use the user's ID for the update

      dispatch({ type: 'INCREMENT_REFRESH_KEY' }) // refresh AFTER update
    }
  }

  const reset = async () => {
    dispatch({ type: 'SET_COUNT', payload: 0 })
    dispatch({ type: 'SET_FLASH', payload: true })

    if (user) {
      await supabase.from('users').update({ counter: 0 }).eq('id', user.id) // Also use user.id here for consistency

      dispatch({ type: 'INCREMENT_REFRESH_KEY' })
    }

    setTimeout(() => dispatch({ type: 'SET_FLASH', payload: false }), 300)
  }

  const fetchNotesForUser = async (userId) => {
    if (!userId) {
      console.warn('No user ID was provided to fetch notes.')
      return [] // Return an empty array to prevent errors
    }

    const { data, error } = await supabase
      .from('notes')
      .select('id, date, note_text, created_at')
      .eq('user_id', userId) // Use the userId argument
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return [] // Return an empty array on error
    }

    // Instead of setting state, we just return the data.
    return Array.isArray(data) ? data : []
  }

  useEffect(() => {
    const fetchUsers = async () => {
      // We only fetch the user list when nobody is logged in.
      if (!user) {
        const { data, error } = await supabase
          .from('users')
          .select('username, counter, team, role, github_username')
          .order('username', { ascending: true })

        if (error) {
          console.error('Supabase fetch error:', error.message)
        } else {
          // Dispatch an action to set the user list in our state
          dispatch({ type: 'SET_USER_LIST', payload: data })
        }
      }
    }

    fetchUsers()
  }, [user]) // This dependency array is correct.

  useEffect(() => {
    const fetchPRsForUser = async () => {
      // If there's no user, or the user object doesn't have a github_username,
      // we clear the pull requests and exit.
      if (!user || !user.github_username) {
        dispatch({ type: 'SET_PULL_REQUESTS', payload: [] })
        return
      }

      try {
        const allPRs = await fetchPullRequests(GITHUB_OWNER, GITHUB_REPO)

        // Filter PRs created by the user's github_username (case-insensitive)
        const prs = allPRs.filter(
          (pr) =>
            pr.user?.login?.toLowerCase() === user.github_username.toLowerCase()
        )

        // Dispatch the fetched PRs to our state
        dispatch({ type: 'SET_PULL_REQUESTS', payload: prs })
      } catch (err) {
        console.error('GitHub PR fetch failed:', err.message)
        // In case of an error, ensure the PR list is empty
        dispatch({ type: 'SET_PULL_REQUESTS', payload: [] })
      }
    }

    fetchPRsForUser()
  }, [user]) // The dependency array now only needs `user`

  const toggleVisibility = () => {
    dispatch({ type: 'TOGGLE_COUNTER' })
  }

  const groupedUsers = userList.reduce((acc, user) => {
    if (!acc[user.team]) acc[user.team] = []
    acc[user.team].push(user)
    return acc
  }, {})

  console.log(userList)

  console.log('👤 user =', user)

  return (
    <div className="app-container">
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
        }}
      >
        <ThemeToggle />
      </div>

      {!user ? (
        // =================================================================
        //  LOGGED-OUT VIEW (User Login & Creation)
        // =================================================================
        <div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-dark)' }}>
              Welcome to Echoboard
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Select a user to begin, or create a new user below.
            </p>
          </div>

          {/* User Selection Grid */}
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
                  <div
                    className="user-card-grid"
                    style={{ marginTop: '1.5rem' }}
                  >
                    {groupedUsers[team].map((userObj) => (
                      <div
                        key={userObj.username}
                        onClick={() => handleQuickLogin(userObj.username)}
                        className="user-card"
                      >
                        <img
                          src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${userObj.username}`}
                          alt={userObj.username}
                          className="avatar-img"
                        />
                        <div className="user-name">{userObj.username}</div>
                        <div className="user-role">{userObj.role}</div>
                      </div>
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
          <div className="widget-card">
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
      ) : (
        // =================================================================
        //  LOGGED-IN VIEW (Dashboard)
        // =================================================================
        <div>
          <header className="app-header">
            <h1>Welcome, {user.username}!</h1>
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
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!noteText.trim()) {
                    alert('Please enter a note before submitting.')
                    return
                  }
                  const { error } = await supabase.from('notes').insert([
                    {
                      user_id: user.id,
                      date: noteDate,
                      note_text: noteText.trim(),
                    },
                  ])
                  if (error) {
                    alert('Failed to save note.')
                    console.error('Insert error:', error)
                    return
                  }
                  const updatedNotes = await fetchNotesForUser(user.id)
                  dispatch({
                    type: 'SUBMIT_NOTE_SUCCESS',
                    payload: updatedNotes,
                  })
                }}
              >
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
              {/* Note: The notes list itself is rendered inside the widget card now */}
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
          </div>
        </div>
      )}
    </div>
  )
}

export default App
