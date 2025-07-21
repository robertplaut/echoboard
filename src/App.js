// src/App.js

import React, { useEffect, useReducer, useCallback } from 'react'
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import LoginPage from './LoginPage'
import DashboardPage from './DashboardPage'
import ThemeToggle from './ThemeToggle'
import supabase from './supabaseClient'
import { fetchPullRequests } from './githubApi'
import './App.css'

const GITHUB_OWNER = 'robertplaut'
const GITHUB_REPO = 'echostatus'

const initialState = {
  user: null,
  userList: [],
  nameInput: '',
  displayNameInput: '',
  email: '',
  newTeam: '',
  newRole: '',
  githubUsername: '',
  userPullRequests: [],
  noteDate: new Date().toISOString().split('T')[0],
  noteText: '',
  userNotes: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'CREATE_USER_SUCCESS':
      return {
        ...state,
        nameInput: '',
        displayNameInput: '',
        email: '',
        newTeam: '',
        newRole: '',
        githubUsername: '',
        userList: [...state.userList, action.payload],
      }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload }
    case 'SET_NOTES':
      return { ...state, userNotes: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, userNotes: [], userPullRequests: [] }
    case 'SET_USER_LIST':
      return { ...state, userList: action.payload }
    case 'SET_PULL_REQUESTS':
      return { ...state, userPullRequests: action.payload }
    case 'SUBMIT_NOTE_SUCCESS':
      return {
        ...state,
        noteText: '',
        noteDate: new Date().toISOString().split('T')[0],
        userNotes: action.payload,
      }

    // 1. Add the new reducer case for a successful profile update
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        user: action.payload, // Update the logged-in user's data
      }

    default:
      return state
  }
}

function DashboardWrapper(props) {
  const { username } = useParams()
  const { user, handleQuickLogin } = props
  useEffect(() => {
    if (!user || user.username !== username) {
      handleQuickLogin(username)
    }
  }, [username, handleQuickLogin])
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
    displayNameInput,
    email,
    newTeam,
    newRole,
    githubUsername,
    userPullRequests,
    noteDate,
    noteText,
    userNotes,
  } = state

  const navigate = useNavigate()
  const location = useLocation()

  const handleQuickLogin = useCallback(
    async (username) => {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()
      if (error || !userData) {
        alert('Error logging in')
        navigate('/')
        return
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
      const notes = await fetchNotesForUser(userData.id)
      dispatch({ type: 'SET_NOTES', payload: notes })
      navigate(`/user/${userData.username}`)
    },
    [navigate]
  )

  const handleCreateUser = async (e) => {
    e.preventDefault()

    // Sanitize the username: convert to lowercase and remove spaces/special chars.
    const sanitizedUsername = nameInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Allows letters, numbers, and hyphens
    const newDisplayName = displayNameInput.trim()
    const newEmail = email.trim()

    if (
      !sanitizedUsername ||
      !newDisplayName ||
      !newEmail ||
      !newTeam ||
      !newRole
    ) {
      alert(
        'Please fill out all required fields. Note that the username can only contain letters, numbers, and hyphens.'
      )
      return
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', sanitizedUsername)
      .single()
    if (existingUser) {
      alert('Username already exists. Choose another.')
      return
    }
    const newUser = {
      username: sanitizedUsername, // Use the sanitized username for the database
      display_name: newDisplayName,
      email: newEmail,
      team: newTeam,
      role: newRole,
      github_username: githubUsername.trim() || null,
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
    navigate('/')
  }

  const handleProfileUpdate = async (formData) => {
    if (!user) return // Safety check

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        display_name: formData.display_name,
        email: formData.email,
        team: formData.team,
        role: formData.role,
        github_username: formData.github_username,
      })
      .eq('id', user.id)
      .select() // Use .select() to get the updated row back from the database
      .single()

    if (error) {
      alert('Failed to update profile.')
      console.error('Update error:', error)
      return
    }

    // Dispatch an action with the updated user data to refresh the UI
    dispatch({ type: 'UPDATE_USER_SUCCESS', payload: updatedUser })
    alert('Profile updated successfully!')
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

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        const { data, error } = await supabase
          .from('users')
          .select('username, team, role, github_username, email, display_name')
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
      navigate('/' + redirectPath, { replace: true })
    }
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
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              groupedUsers={groupedUsers}
              handleQuickLogin={handleQuickLogin}
              handleCreateUser={handleCreateUser}
              nameInput={nameInput}
              displayNameInput={displayNameInput}
              email={email}
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
              handleQuickLogin={handleQuickLogin}
              handleLogout={handleLogout}
              // 3. Pass the new handler function down as a prop
              handleProfileUpdate={handleProfileUpdate}
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
