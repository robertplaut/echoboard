// src/ThemeToggle.js

import React from 'react'
import { useTheme } from './useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  const style = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
  }

  const iconStyle = {
    width: '20px',
    height: '20px',
    color: 'var(--color-text-primary)',
    transition: 'color 0.2s ease',
  }

  return (
    <button onClick={toggleTheme} style={style} aria-label="Toggle theme">
      {theme === 'light' ? (
        // Moon Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={iconStyle}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Sun Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={iconStyle}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
