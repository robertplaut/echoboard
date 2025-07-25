// src/AISummary.js

import React from "react";

// This component will receive several props from DashboardPage to manage its state:
// - onGenerate: The function to call when the "Generate" button is clicked.
// - summary: The AI-generated summary text.
// - isSummarizing: A boolean to know when to show a loading state.
// - error: Any error message that occurs.
// - onClear: A function to clear the current summary and error.
const AISummary = ({ onGenerate, summary, isSummarizing, error, onClear }) => {
  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2>✨ AI Daily Summary</h2>
        <p className="widget-subheading">
          Today's notes will be sent to AI for review based on users selected in
          the Summary Aggregator.
        </p>
        {/* We only show the "Clear" button if there's a summary or an error to clear. */}
        {(summary || error) && (
          <button onClick={onClear} className="btn-secondary btn-small">
            Clear
          </button>
        )}
      </div>

      {/* If there's no summary and no error, show the initial state with the button */}
      {!summary && !error && (
        <div>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 0 }}>
            Generate an AI-powered summary of the notes from the "Aggregated
            Summary" view below.
          </p>
          <button onClick={onGenerate} disabled={isSummarizing} className="btn">
            {isSummarizing ? "Generating..." : "✨ Generate Summary"}
          </button>
        </div>
      )}

      {isSummarizing && !summary && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>
            AI is thinking, please wait...
          </p>
          <div className="loader" aria-label="Loading AI Summary" />
        </div>
      )}

      {/* If an error occurred, display it in a distinct style */}
      {error && (
        <div style={{ color: "var(--color-error)", whiteSpace: "pre-wrap" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* If a summary exists, render it as HTML. */}
      {summary && (
        <div
          className="ai-summary-content"
          // This is the standard and safe way in React to render a string of HTML.
          // We trust the HTML coming from our own serverless function.
          dangerouslySetInnerHTML={{ __html: summary }}
        />
      )}
    </div>
  );
};

export default AISummary;
