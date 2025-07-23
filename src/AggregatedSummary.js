// src/AggregatedSummary.js

import React, { useState, useEffect } from "react";
import supabase from "./supabaseClient";

// This component now ONLY needs the logged-in user's data
const AggregatedSummary = ({ user }) => {
  const [activeToggle, setActiveToggle] = useState("Today");
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAggregatedNotes = async () => {
      if (
        !user ||
        !user.selected_user_ids ||
        user.selected_user_ids.length === 0
      ) {
        setNotes([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      let startDate = new Date(today);
      let endDate = new Date(today);
      endDate.setUTCHours(23, 59, 59, 999);

      if (activeToggle === "This Week") {
        const dayOfWeek = today.getUTCDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setUTCDate(today.getUTCDate() - diff);
      } else if (activeToggle === "This Month") {
        startDate = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
        );
      }

      const startDateString = startDate.toISOString().split("T")[0];
      const endDateString = endDate.toISOString().split("T")[0];

      // UPDATED QUERY: Fetch display_name, role, and team from the related users table
      const { data, error } = await supabase
        .from("notes")
        .select(`*, user:users(display_name, role, team)`)
        .in("user_id", user.selected_user_ids)
        .gte("date", startDateString)
        .lte("date", endDateString)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching aggregated notes:", error);
        setNotes([]);
      } else {
        setNotes(data || []);
      }

      setIsLoading(false);
    };

    fetchAggregatedNotes();
  }, [activeToggle, user]);

  // --- Data Transformation ---
  // Group notes by user ID to handle multiple notes from the same user
  const groupedNotes = notes.reduce((acc, note) => {
    const userId = note.user_id;
    if (!acc[userId]) {
      // Initialize the user's group with their info and an empty notes array
      acc[userId] = {
        userInfo: note.user,
        notes: [],
      };
    }
    acc[userId].notes.push(note);
    return acc;
  }, {});

  // Convert the object to an array and then sort it
  const userGroups = Object.values(groupedNotes).sort((a, b) => {
    // Primary sort: by team name
    if (a.userInfo.team < b.userInfo.team) return -1;
    if (a.userInfo.team > b.userInfo.team) return 1;

    // Secondary sort: by display name, if teams are the same
    if (a.userInfo.display_name < b.userInfo.display_name) return -1;
    if (a.userInfo.display_name > b.userInfo.display_name) return 1;

    return 0; // if both are equal
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
          A real-time summary of notes from your selected users.
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
        {isLoading ? (
          <p>Loading summary...</p>
        ) : userGroups.length === 0 ? (
          <p>No notes found for the selected users in this period.</p>
        ) : (
          (() => {
            let lastTeam = null; // Our tracker variable
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
                    {group.notes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          padding: "0.75rem 0.5rem",
                          borderBottom: `1px solid ${
                            showTeamHeader
                              ? "var(--color-border)"
                              : "var(--color-background)"
                          }`,
                        }}
                      >
                        <strong
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {new Date(note.date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              timeZone: "UTC",
                            }
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
