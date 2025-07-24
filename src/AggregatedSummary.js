import React, { useState } from "react";

const AggregatedSummary = ({ aggregatedNotes, userList }) => {
  const [activeToggle, setActiveToggle] = useState("Today");

  // First, filter the notes based on the active date toggle
  const filteredNotes = aggregatedNotes.filter((note) => {
    const noteDate = new Date(note.date + "T00:00:00Z");
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (activeToggle === "Today") {
      return noteDate.getTime() === today.getTime();
    }

    if (activeToggle === "This Week") {
      const startOfWeek = new Date(today);
      const day = today.getUTCDay();
      const diff = day === 0 ? 6 : day - 1;
      startOfWeek.setUTCDate(today.getUTCDate() - diff);
      return noteDate >= startOfWeek;
    }

    if (activeToggle === "This Month") {
      const startOfMonth = new Date(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        1
      );
      return noteDate >= startOfMonth;
    }
    return true;
  });

  // Now, group the filtered notes by user
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const userId = note.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        userInfo: userList.find((u) => u.id === userId) || {},
        notes: [],
      };
    }
    acc[userId].notes.push(note);
    return acc;
  }, {});

  // Convert the grouped object into an array for sorting and rendering
  const userGroups = Object.values(groupedNotes).sort((a, b) => {
    const teamA = a.userInfo.team || "";
    const teamB = b.userInfo.team || "";
    if (teamA < teamB) return -1;
    if (teamA > teamB) return 1;

    const nameA = a.userInfo.display_name || "";
    const nameB = b.userInfo.display_name || "";
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    return 0;
  });

  return (
    <div>
      <div className="widget-header">
        <h2>Aggregated Summary View</h2>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginTop: "0.25rem",
            fontWeight: "400",
            fontSize: "0.9rem",
          }}
        >
          A real-time summary of notes from your selected users for the chosen
          period.
        </p>
      </div>

      <div
        className="toggle-switch-container"
        style={{ marginBottom: "1.5rem" }}
      >
        <button
          onClick={() => setActiveToggle("Today")}
          className={`toggle-switch-button ${
            activeToggle === "Today" ? "active" : ""
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveToggle("This Week")}
          className={`toggle-switch-button ${
            activeToggle === "This Week" ? "active" : ""
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveToggle("This Month")}
          className={`toggle-switch-button ${
            activeToggle === "This Month" ? "active" : ""
          }`}
        >
          This Month
        </button>
      </div>

      <div className="widget-scroll-container">
        {userGroups.length === 0 ? (
          <p>No notes found for the selected users in this period.</p>
        ) : (
          (() => {
            let lastTeam = null;
            return userGroups.map((group) => {
              const currentTeam = group.userInfo.team;
              const showTeamHeader = currentTeam !== lastTeam;
              lastTeam = currentTeam;

              return (
                <div key={group.userInfo.display_name}>
                  {showTeamHeader && (
                    <h2
                      style={{
                        marginTop: "2rem",
                        paddingBottom: "0.5rem",
                        borderBottom: "2px solid var(--color-primary)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {currentTeam}
                    </h2>
                  )}

                  <div style={{ marginTop: "1rem" }}>
                    <h3
                      style={{
                        color: "var(--color-dark)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {group.userInfo.display_name}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-secondary)",
                          marginLeft: "0.5rem",
                          fontWeight: "400",
                        }}
                      >
                        ({group.userInfo.role})
                      </span>
                    </h3>
                    {/* Inner loop for this user's notes */}
                    {group.notes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          padding: "0.75rem 0.5rem",
                          borderBottom: `1px solid var(--color-border)`,
                        }}
                      >
                        <strong
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          Note from:{" "}
                          {new Date(note.date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", timeZone: "UTC" }
                          )}
                        </strong>
                        {note.yesterday_text && (
                          <p
                            style={{
                              margin: "0.25rem 0",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <strong>Yesterday:</strong> {note.yesterday_text}
                          </p>
                        )}
                        {note.today_text && (
                          <p
                            style={{
                              margin: "0.25rem 0",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <strong>Today:</strong> {note.today_text}
                          </p>
                        )}
                        {note.blockers_text && (
                          <p
                            style={{
                              margin: "0.25rem 0",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <strong>Blockers:</strong> {note.blockers_text}
                          </p>
                        )}
                        {note.learnings_text && (
                          <p
                            style={{
                              margin: "0.25rem 0",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <strong>Learnings:</strong> {note.learnings_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default AggregatedSummary;
