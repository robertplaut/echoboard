// src/CounterButton.js

import React from 'react'

// Add `className` to the destructured props
function CounterButton({ label, onClick, className = '' }) {
  // Remove the old inline style and apply the className prop
  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  )
}

export default CounterButton
