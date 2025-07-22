// src/ToastContext.js

import React, { createContext, useContext } from 'react'

// 1. Create the context with a default value.
// The `addToast` function will be provided by our ToastProvider.
const ToastContext = createContext({
  addToast: () => {}, // Default to an empty function
})

// 2. Create a custom hook for easy consumption of the context.
// Any component that calls `useToast()` will get access to the `addToast` function.
export const useToast = () => {
  return useContext(ToastContext)
}

export default ToastContext
