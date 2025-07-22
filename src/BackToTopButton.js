// src/BackToTopButton.js

import React, { useState, useEffect } from 'react'
import './BackToTopButton.css' // Import our new styles

const BackToTopButton = () => {
  // 1. State to track whether the button should be visible
  const [isVisible, setIsVisible] = useState(false)

  // 2. A function to check the scroll position and update the state
  const toggleVisibility = () => {
    // Show the button if the user has scrolled down more than 300px
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // 3. A function to scroll the window back to the top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This provides the smooth scrolling animation
    })
  }

  // 4. Set up an effect to listen for scroll events
  useEffect(() => {
    // Add the event listener when the component mounts
    window.addEventListener('scroll', toggleVisibility)

    // Clean up the event listener when the component unmounts
    // This is crucial to prevent memory leaks!
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, []) // The empty array ensures this effect runs only once

  return (
    <button
      className={`back-to-top-button ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Go to top"
    >
      {/* A simple, inline SVG for the arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
      </svg>
    </button>
  )
}

export default BackToTopButton
