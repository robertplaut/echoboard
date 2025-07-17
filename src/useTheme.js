// src/useTheme.js

import { useState, useEffect } from 'react'

export const useTheme = () => {
  // 1. Get user's preference from localStorage, or default to 'light'
  const [theme, setTheme] = useState(() => {
    const storedTheme = window.localStorage.getItem('theme')
    return storedTheme !== null ? storedTheme : 'light'
  })

  // 2. An effect that runs when the theme state changes
  useEffect(() => {
    // Set the data-theme attribute on the body element
    document.body.setAttribute('data-theme', theme)

    // Save the user's preference to localStorage
    window.localStorage.setItem('theme', theme)
  }, [theme]) // Only re-run this effect if `theme` changes

  // 3. The function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // 4. Return the current theme and the toggle function
  return { theme, toggleTheme }
}
