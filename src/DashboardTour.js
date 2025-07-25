// src/DashboardTour.js
import { TourProvider } from "@reactour/tour";

// 1. Define the steps for the dashboard tour
const steps = [
  {
    selector: '[data-tour="daily-note"]',
    content:
      "Here is where you will input your updates for the current day. You may also use this form to update an older entry.",
  },
  {
    selector: '[data-tour="past-notes"]',
    content:
      "This is where you can find all the notes you've added to Echostatus, listed in reverse-chronological order.",
  },
  {
    selector: '[data-tour="github-prs"]',
    content:
      "We use your GitHub username to find all your Pull Requests for the project and list them here for easy access.",
  },
  {
    selector: '[data-tour="edit-profile"]',
    content:
      "You can update any field in your profile except for your username. Changes are saved instantly.",
  },
  {
    selector: '[data-tour="summary-aggregator"]',
    content:
      "You have total control over which teammates' notes appear in the summary views. Just check the boxes next to their names.",
  },
  {
    selector: '[data-tour="aggregated-summary"]',
    content:
      "This view provides a real-time feed of all notes from the users you selected in the aggregator.",
  },
  {
    selector: '[data-tour="ai-summary"]',
    content:
      "After selecting users, you can generate an AI-powered summary of their notes from today for a quick overview.",
  },
];

// 2. Define the styles (we can reuse the same style logic)
const tourStyles = {
  popover: (base) => ({
    ...base,
    "--reactour-accent": "var(--color-primary)",
    borderRadius: "8px",
    boxShadow: "var(--shadow-sm)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
  }),
  mask: (base) => ({
    ...base,
    backgroundColor: "rgba(18, 18, 18, 0.7)",
  }),
};

// 3. Create the wrapper component
const DashboardTour = ({ children }) => {
  return (
    <TourProvider
      steps={steps}
      styles={tourStyles}
      scrollSmooth
      disableInteraction={true}
    >
      {children}
    </TourProvider>
  );
};

export default DashboardTour;
