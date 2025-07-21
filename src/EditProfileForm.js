// src/EditProfileForm.js

import React, { useState, useEffect } from 'react'

function EditProfileForm({ user, onSave }) {
  // 1. This component manages its own form state
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    team: '',
    role: '',
    github_username: '',
  })

  // 2. When the `user` prop changes, pre-fill the form
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        team: user.team || '',
        role: user.role || '',
        github_username: user.github_username || '',
      })
    }
  }, [user])

  // 3. A single handler to update any field in the form state
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // 4. When the form is submitted, call the onSave function from props,
    // passing the current form data up to the parent.
    onSave(formData)
  }

  // Don't render the form if there's no user data yet
  if (!user) {
    return null
  }

  return (
    <div className="widget-card">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="display_name">Display Name</label>
          <input
            id="display_name"
            name="display_name" // This name must match the state property
            type="text"
            value={formData.display_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username (cannot be changed)</label>
          <input
            id="username"
            type="text"
            value={user.username}
            disabled // The username is read-only
            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email" // The name attribute is crucial for the handleChange function
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="team">Team</label>
          <select
            id="team"
            name="team"
            value={formData.team}
            onChange={handleChange}
          >
            <option value="ENGINEERING">ENGINEERING</option>
            <option value="PMO">PMO</option>
            <option value="PRODUCT">PRODUCT</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
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
          <label htmlFor="github_username">GitHub Username</label>
          <input
            id="github_username"
            name="github_username"
            type="text"
            value={formData.github_username}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn">
          Save Changes
        </button>
      </form>
    </div>
  )
}

export default EditProfileForm
