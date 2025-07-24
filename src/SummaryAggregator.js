import { useState, useEffect, useRef, useCallback } from "react";

// 1. Accept the new `fetchAggregatedNotes` prop
function SummaryAggregator({
  user,
  userList,
  onSaveSelection,
  fetchAggregatedNotes,
}) {
  const [selected, setSelected] = useState({});
  const debounceTimer = useRef(null);

  // 2. We create a stable function with useCallback to get the selected IDs.
  // This ensures our effects don't re-run unnecessarily.
  const getSelectedIds = useCallback(() => {
    return Object.keys(selected).filter((id) => selected[id]);
  }, [selected]);

  // This effect is now ONLY responsible for populating the checkboxes from props.
  // It runs once when the component loads or when the user object changes.
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

  // 3. A new effect that runs whenever the selection changes.
  // Its job is to fetch the notes for the summary view.
  useEffect(() => {
    const selectedIds = getSelectedIds();
    // We call the function passed down from App.js
    fetchAggregatedNotes(selectedIds);
  }, [selected, fetchAggregatedNotes, getSelectedIds]); // It re-runs when the selection changes.

  const handleCheckboxChange = (userId) => {
    const newSelectedState = {
      ...selected,
      [userId]: !selected[userId],
    };
    setSelected(newSelectedState);

    // Debounced save logic (this remains the same)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const selectedIds = Object.keys(newSelectedState).filter(
        (id) => newSelectedState[id]
      );
      onSaveSelection(selectedIds);
    }, 1000);
  };

  // The JSX part of the component remains exactly the same.
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
            Select users to include in the real-time aggregated summary view and
            the AI summary generation.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            <li>Your selections are saved automatically.</li>
            <li>AI summary will be based on these selections.</li>
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
