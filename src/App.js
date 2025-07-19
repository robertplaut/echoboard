// src/App.js

import React, { useEffect, useReducer, useCallback } from 'react'
// 1. Import routing components
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'

// Import our new page components
import LoginPage from './LoginPage'
import DashboardPage from './DashboardPage'

// Other component imports
import ThemeToggle from './ThemeToggle'
import supabase from './supabaseClient'
import { fetchPullRequests } from './githubApi'
import './App.css'

const GITHUB_OWNER = 'robertplaut'
const GITHUB_REPO = 'echoboard'

// The initialState and reducer function remain EXACTLY the same.
// NO CHANGES in this section.
const initialState = {
  user: null,
  userList: [],
  // ... other state properties
  noteText: '',
  userNotes: [],
}

function reducer(state, action) {
  // ... This function is unchanged.
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
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
      return { ...state, userNotes: action.payload }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        count: 0,
        userNotes: [],
        userPullRequests: [],
      }
    case 'SET_COUNT':
      return { ...state, count: action.payload }
    case 'SET_FLASH':
      return { ...state, flash: action.payload }
    case 'INCREMENT_REFRESH_KEY':
      return { ...state, refreshKey: state.refreshKey + 1 }
    case 'SET_USER_LIST':
      return { ...state, userList: action.payload }
    case 'SET_PULL_REQUESTS':
      return { ...state, userPullRequests: action.payload }
    case 'TOGGLE_COUNTER':
      return { ...state, showCounter: !state.showCounter }
    case 'SUBMIT_NOTE_SUCCESS':
      return {
        ...state,
        noteText: '',
        noteDate: new Date().toISOString().split('T')[0],
        userNotes: action.payload,
      }
    default:
      return state
  }
}

// A new wrapper component to handle data loading for the dashboard
// Update this wrapper component
function DashboardWrapper(props) {
  const { username } = useParams()
  const { user, handleQuickLogin } = props // Destructure for readability

  useEffect(() => {
    // The logic inside remains the same
    if (!user || user.username !== username) {
      handleQuickLogin(username)
    }
    // BUT we update the dependency array to be much stricter
  }, [username, handleQuickLogin]) // Only re-run if the username from the URL changes

  if (!user || user.username !== username) {
    return <div>Loading user dashboard...</div>
  }

  return <DashboardPage {...props} />
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    user,
    userList,
    nameInput,
    newTeam,
    newRole,
    githubUsername,
    userPullRequests,
    noteDate,
    noteText,
    userNotes,
  } = state

  // 2. Initialize the navigate function
  const navigate = useNavigate()

  const location = useLocation()

  // This function is now ASYNCHRONOUS to work better with navigation
  // Wrap this function in useCallback
  const handleQuickLogin = useCallback(
    async (username) => {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !userData) {
        alert('Error logging in')
        navigate('/') // Navigate home on error
        return
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
      const notes = await fetchNotesForUser(userData.id)
      dispatch({ type: 'SET_NOTES', payload: notes })

      navigate(`/user/${userData.username}`)
    },
    [navigate]
  ) // The dependency is navigate

  const handleCreateUser = async (e) => {
    e.preventDefault()
    const newUsername = nameInput.trim()

    if (!newUsername || !newTeam || !newRole) {
      alert('Please fill out all required fields.')
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
      console.error('Insert error:', error)
      return
    }
    dispatch({ type: 'CREATE_USER_SUCCESS', payload: newUser })
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    // 4. Navigate back to the login page on logout
    navigate('/')
  }

  const fetchNotesForUser = async (userId) => {
    if (!userId) return []
    const { data, error } = await supabase
      .from('notes')
      .select('id, date, note_text, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    return Array.isArray(data) ? data : []
  }

  // New handler for note submission to pass to DashboardPage
  const handleNoteSubmit = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) {
      alert('Please enter a note before submitting.')
      return
    }
    const { error } = await supabase
      .from('notes')
      .insert([
        { user_id: user.id, date: noteDate, note_text: noteText.trim() },
      ])
    if (error) {
      alert('Failed to save note.')
      console.error('Insert error:', error)
      return
    }
    const updatedNotes = await fetchNotesForUser(user.id)
    dispatch({ type: 'SUBMIT_NOTE_SUCCESS', payload: updatedNotes })
  }

  // This useEffect hook for fetching all users remains the same
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        const { data, error } = await supabase
          .from('users')
          .select('username, counter, team, role, github_username')
          .order('username', { ascending: true })
        if (error) {
          console.error('Supabase fetch error:', error.message)
        } else {
          dispatch({ type: 'SET_USER_LIST', payload: data })
        }
      }
    }
    fetchUsers()
  }, [user])

  // This useEffect hook for fetching PRs remains the same
  useEffect(() => {
    const fetchPRsForUser = async () => {
      if (!user || !user.github_username) {
        dispatch({ type: 'SET_PULL_REQUESTS', payload: [] })
        return
      }
      try {
        const allPRs = await fetchPullRequests(GITHUB_OWNER, GITHUB_REPO)
        const prs = allPRs.filter(
          (pr) =>
            pr.user?.login?.toLowerCase() === user.github_username.toLowerCase()
        )
        dispatch({ type: 'SET_PULL_REQUESTS', payload: prs })
      } catch (err) {
        console.error('GitHub PR fetch failed:', err.message)
        dispatch({ type: 'SET_PULL_REQUESTS', payload: [] })
      }
    }
    fetchPRsForUser()
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const redirectPath = params.get('path')

    if (redirectPath) {
      // If a path was passed in the query, navigate to it,
      // replacing the current history entry.
      navigate('/' + redirectPath, { replace: true })
    }
    // The empty dependency array [] ensures this runs only once on mount.
    // We disable the ESLint warning because we intentionally want this effect
    // to not re-run when navigate or location change after the initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groupedUsers = userList.reduce((acc, u) => {
    if (!acc[u.team]) acc[u.team] = []
    acc[u.team].push(u)
    return acc
  }, {})

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

      {/* 5. The new routing structure */}
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              groupedUsers={groupedUsers}
              handleQuickLogin={handleQuickLogin}
              handleCreateUser={handleCreateUser}
              nameInput={nameInput}
              newTeam={newTeam}
              newRole={newRole}
              githubUsername={githubUsername}
              dispatch={dispatch}
            />
          }
        />
        <Route
          path="/user/:username"
          element={
            <DashboardWrapper
              user={user}
              handleQuickLogin={handleQuickLogin} // Pass login function for data loading
              handleLogout={handleLogout}
              userPullRequests={userPullRequests}
              userNotes={userNotes}
              noteDate={noteDate}
              noteText={noteText}
              handleNoteSubmit={handleNoteSubmit}
              dispatch={dispatch}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
