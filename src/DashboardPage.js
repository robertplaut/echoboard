// src/DashboardPage.js

import React, { useEffect } from "react";
import { useTour } from "./TourContext";
import CounterButton from "./CounterButton";
import GitHubPRList from "./GitHubPRList";
import EditProfileForm from "./EditProfileForm";
import SummaryAggregator from "./SummaryAggregator";
import AggregatedSummary from "./AggregatedSummary";
import AISummary from "./AISummary";

function DashboardPage({
  user,
  userList,
  handleLogout,
  userPullRequests,
  userNotes,
  noteDate,
  yesterdayText,
  todayText,
  blockersText,
  learningsText,
  handleNoteSubmit,
  handleProfileUpdate,
  handleSaveSelection,
  dispatch,
  isSummarizing,
  aiSummary,
  aiError,
  handleGenerateSummary,
  aggregatedNotes,
  fetchAggregatedNotes,
}) {
  useEffect(() => {
    dispatch({ type: "CLEAR_AI_SUMMARY" });
  }, [user.id, dispatch]);

  const { startTour } = useTour();

  // Define the steps specifically for the dashboard tour
  const dashboardTourSteps = [
    {
      selector: '[data-tour-id="daily-note"]',
      content:
        "Here is where you will input your updates for the current day. You may also use this form to update an older entry.",
    },
    {
      selector: '[data-tour-id="past-notes"]',
      content:
        "This is where you can find all the notes you've added to Echostatus, listed in reverse-chronological order.",
    },
    {
      selector: '[data-tour-id="github-prs"]',
      content:
        "We use your GitHub username to find all your Pull Requests for the project and list them here for easy access.",
    },
    {
      selector: '[data-tour-id="edit-profile"]',
      content:
        "You can update any field in your profile except for your username. Changes are saved instantly.",
    },
    {
      selector: '[data-tour-id="summary-aggregator"]',
      content:
        "You have total control over which teammates' notes appear in the summary views. Just check the boxes next to their names.",
    },
    {
      selector: '[data-tour-id="aggregated-summary"]',
      content:
        "This view provides a real-time feed of all notes from the users you selected in the aggregator.",
    },
    {
      selector: '[data-tour-id="ai-summary"]',
      content:
        "After selecting users, you can generate an AI-powered summary of their notes from today for a quick overview.",
    },
  ];

  const handleStartTour = () => {
    startTour(dashboardTourSteps);
  };

  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Welcome, {user.display_name}!</h1>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
            }}
          >
            {user.role} - {user.team}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleStartTour}
            className="tour-button"
            aria-label="Start dashboard tour"
            style={{ position: "static" }} // Use static positioning here
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <CounterButton
            label="Logout"
            onClick={handleLogout}
            className="btn btn-logout"
          />
        </div>
      </header>

      <div className="dashboard-grid">
        {/* --- Daily Standup Note FORM Widget --- */}
        <div className="widget-card tucked-corners" data-tour-id="daily-note">
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
          <div className="widget-header">
            <h2>📝 Daily Standup Note</h2>
          </div>
          <form onSubmit={handleNoteSubmit}>
            <div className="form-group">
              <label htmlFor="note-date">Date</label>
              <input
                id="note-date"
                type="date"
                value={noteDate}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "noteDate",
                    value: e.target.value,
                  })
                }
              />
            </div>
            {/* Yesterday */}
            <div className="form-group">
              <label htmlFor="yesterday-text">
                What did you accomplish yesterday?
              </label>
              <textarea
                id="yesterday-text"
                value={yesterdayText}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "yesterdayText",
                    value: e.target.value,
                  })
                }
                rows="3"
              />
            </div>
            {/* Today */}
            <div className="form-group">
              <label htmlFor="today-text">What are you working on today?</label>
              <textarea
                id="today-text"
                value={todayText}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "todayText",
                    value: e.target.value,
                  })
                }
                rows="3"
              />
            </div>
            {/* Blockers */}
            <div className="form-group">
              <label htmlFor="blockers-text">Do you have any blockers?</label>
              <textarea
                id="blockers-text"
                value={blockersText}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "blockersText",
                    value: e.target.value,
                  })
                }
                rows="2"
              />
            </div>
            {/* Learnings */}
            <div className="form-group">
              <label htmlFor="learnings-text">Learnings / Other Notes</label>
              <textarea
                id="learnings-text"
                value={learningsText}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "learningsText",
                    value: e.target.value,
                  })
                }
                rows="2"
              />
            </div>
            <button type="submit" className="btn">
              Save Note
            </button>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                marginTop: "1rem",
                textAlign: "left",
              }}
            >
              <p>Notes:</p>
              <ul>
                <li>
                  All fields are optional, but at least one must be used to
                  save.
                </li>
                <li>You may update notes from past dates if needed</li>
                <li>After saving past note, form returns to today's date</li>
              </ul>
            </div>
          </form>
        </div>

        {/* --- Past Notes LIST Widget --- */}
        <div className="widget-card" data-tour-id="past-notes">
          <div className="widget-header">
            <h2>Past Notes</h2>
          </div>
          <div className="widget-scroll-container">
            {userNotes.length === 0 ? (
              <p>No notes yet.</p>
            ) : (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {userNotes.map((note) => (
                  <li
                    key={note.id}
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-background)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1em",
                        color: "var(--color-dark)",
                        fontWeight: "700",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {new Date(note.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        }
                      )}
                    </div>
                    {note.yesterday_text && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Yesterday:
                        </strong>
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {note.yesterday_text}
                        </div>
                      </div>
                    )}
                    {note.today_text && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Today:
                        </strong>
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {note.today_text}
                        </div>
                      </div>
                    )}
                    {note.blockers_text && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Blocker(s):
                        </strong>
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {note.blockers_text}
                        </div>
                      </div>
                    )}
                    {note.learnings_text && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Learning(s):
                        </strong>
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {note.learnings_text}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- GitHub PRs Widget --- */}
        <div className="widget-card" data-tour-id="github-prs">
          <GitHubPRList user={user} pullRequests={userPullRequests} />
        </div>

        {/* --- Edit Profile & Summary Aggregator Widgets --- */}
        <div data-tour-id="edit-profile">
          <EditProfileForm user={user} onSave={handleProfileUpdate} />
        </div>

        {/* --- Aggregated Summary View Widget --- */}
        <div className="widget-card" data-tour-id="aggregated-summary">
          <div className="widget-card">
            <AggregatedSummary
              userList={userList}
              aggregatedNotes={aggregatedNotes}
            />
          </div>
        </div>

        <div data-tour-id="summary-aggregator">
          <SummaryAggregator
            user={user}
            userList={userList}
            onSaveSelection={handleSaveSelection}
            fetchAggregatedNotes={fetchAggregatedNotes}
          />
        </div>

        {/* --- AI Summary Widget --- */}
        <div data-tour-id="ai-summary">
          <AISummary
            onGenerate={handleGenerateSummary}
            summary={aiSummary}
            isSummarizing={isSummarizing}
            error={aiError}
            onClear={() => dispatch({ type: "CLEAR_AI_SUMMARY" })}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
