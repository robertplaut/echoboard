import React, { useState, useEffect } from "react";

function SummaryAggregator({ user, userList, onSaveSelection }) {
  // 1. This component manages its own state for which checkboxes are checked.
  // The state is an object where keys are user IDs and values are booleans.
  // e.g., { 'user-id-1': true, 'user-id-2': false }
  const [selected, setSelected] = useState({});

  // 2. Pre-populate the checkboxes when the component loads or the user's saved data changes.
  useEffect(() => {
    // `user.selected_user_ids` is the array of IDs we saved in Supabase.
    // We convert this array into the object format our state needs.
    const previouslySelected = (user.selected_user_ids || []).reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {}
    );
    setSelected(previouslySelected);
  }, [user.selected_user_ids]);

  // 3. A handler for when a checkbox is clicked.
  const handleCheckboxChange = (userId) => {
    setSelected((prevSelected) => ({
      ...prevSelected,
      [userId]: !prevSelected[userId], // Toggle the boolean value
    }));
  };

  // 4. When the form is submitted...
  const handleSubmit = (e) => {
    e.preventDefault();
    // We convert our state object back into an array of just the selected IDs.
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    // Then we call the onSaveSelection function passed from App.js.
    onSaveSelection(selectedIds);
  };

  // Group users by team for display, just like on the login page.
  // We'll filter out the currently logged-in user from the list.
  const groupedUsers = userList
    .filter((u) => u.id !== user.id) // Don't show the current user in the list
    .reduce((acc, u) => {
      if (!acc[u.team]) acc[u.team] = [];
      acc[u.team].push(u);
      return acc;
    }, {});

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2>Summary Aggregator</h2>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginTop: "0.25rem", // Adjusted margin for better spacing
            fontWeight: "400", // Lighter font weight for subtitle
            fontSize: "0.9rem", // Slightly smaller font size
          }}
        >
          Select users to include in a combined summary.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="widget-scroll-container">
          {Object.keys(groupedUsers)
            .sort()
            .map((team) => (
              <div key={team} style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "var(--color-dark)",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {team}
                </h3>
                {groupedUsers[team].map((listUser) => (
                  <div key={listUser.id} className="form-group">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "400",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[listUser.id]} // Use !! to ensure it's a boolean (true/false)
                        onChange={() => handleCheckboxChange(listUser.id)}
                        style={{
                          marginRight: "0.75rem",
                          height: "1rem",
                          width: "1rem",
                        }}
                      />
                      {listUser.display_name}
                    </label>
                  </div>
                ))}
              </div>
            ))}
        </div>
        <button type="submit" className="btn">
          Save Selection
        </button>
      </form>
    </div>
  );
}

export default SummaryAggregator;
