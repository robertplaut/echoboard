// src/ToastProvider.js

import React, { useState, useCallback, useEffect } from 'react'
import ToastContext from './ToastContext'
import './Toast.css' // Import our new styles

// --- Individual Toast Component ---
const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false)

  // This function will now handle the start of the exit process
  const startExit = useCallback(() => {
    setIsExiting(true)
    // Set a timeout that matches the CSS animation duration
    setTimeout(() => {
      onRemove(toast.id)
    }, 500) // 500ms = 0.5s
  }, [toast.id, onRemove])

  // Auto-dismiss timer
  useEffect(() => {
    // If the toast is already exiting, don't start a new timer
    if (isExiting) return

    const timer = setTimeout(() => {
      startExit()
    }, 4500) // Start exit animation after 4.5 seconds

    return () => {
      clearTimeout(timer)
    }
  }, [isExiting, startExit])

  // Combine the base class with the exiting class if needed
  const toastClassName = `toast-item ${toast.type} ${
    isExiting ? 'exiting' : ''
  }`

  return (
    <div className={toastClassName}>
      <h3>{toast.title}</h3>
      <p>{toast.message}</p>
      {/* The close button now also just starts the exit animation */}
      <button onClick={startExit} className="toast-close-button">
        ×
      </button>
    </div>
  )
}

// --- Toast Container Component ---
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// --- Toast Provider Component ---
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // useCallback ensures these functions aren't recreated on every render,
  // which is a good practice for functions passed down in context.
  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  const addToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() // Simple unique ID
    const toastTitle =
      title || (type === 'success' ? 'Success!' : 'An Error Occurred')

    setToasts((currentToasts) => [
      ...currentToasts,
      { id, message, type, title: toastTitle },
    ])
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
