// src/SummaryAggregator.js

import React, { useState, useEffect, useRef } from "react";

function SummaryAggregator({ user, userList, onSaveSelection }) {
  const [selected, setSelected] = useState({});

  // This ref will hold the timer ID for our debounce logic.
  // Using a ref ensures the timer is not reset on every render.
  const debounceTimer = useRef(null);

  // This effect is ONLY responsible for populating the checkboxes from props.
  useEffect(() => {
    const previouslySelected = (user.selected_user_ids || []).reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {}
    );
    setSelected(previouslySelected);
  }, [user.selected_user_ids]);

  // This is the handler for a user clicking a checkbox.
  const handleCheckboxChange = (userId) => {
    // 1. Update the local state immediately for a responsive UI.
    const newSelectedState = {
      ...selected,
      [userId]: !selected[userId],
    };
    setSelected(newSelectedState);

    // 2. Start the debounced save process.
    // Clear any existing timer to reset the debounce period.
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer.
    debounceTimer.current = setTimeout(() => {
      // After 1 second, convert the state to an array of IDs and save.
      const selectedIds = Object.keys(newSelectedState).filter(
        (id) => newSelectedState[id]
      );
      onSaveSelection(selectedIds);
    }, 1000); // 1-second debounce delay
  };

  // The rest of the component is exactly as it was.
  const groupedUsers = userList.reduce((acc, u) => {
    if (!acc[u.team]) acc[u.team] = [];
    acc[u.team].push(u);
    return acc;
  }, {});

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2>Summary Aggregator</h2>
        <div
          style={{
            color: "var(--color-text-secondary)",
            marginTop: "0.25rem",
            fontWeight: "400",
            fontSize: "0.9rem",
            lineHeight: "1.4",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0" }}>
            Select users to receive a daily AI-powered summary email. This
            report:
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            <li>
              Summarizes recent <strong>notes</strong> and{" "}
              <strong>pull requests</strong>.
            </li>
            <li>Provides a quick overview of your team's progress.</li>
            <li>Is delivered to your inbox every morning.</li>
          </ul>
        </div>
      </div>

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
                      checked={!!selected[listUser.id]}
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
    </div>
  );
}

export default SummaryAggregator;
