// src/LoginTour.js
import { TourProvider } from "@reactour/tour";

// 1. Define the steps for our tour
const steps = [
  {
    // This is the selector we added to the user card
    selector: '[data-tour="user-card"]',
    // This is the text that will be displayed in the popover
    content:
      "Welcome to Echostatus! Click on any user card like this one to log in and view their dashboard.",
  },
  // We can add more steps here in the future
];

// 2. Define the styles for the tour popover
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
    // Use a semi-transparent version of our dark color for the overlay
    backgroundColor: "rgba(18, 18, 18, 0.7)",
  }),
  // We can leave other elements with their default styles for now
};

// 3. Create the wrapper component
const LoginTour = ({ children }) => {
  return (
    <TourProvider steps={steps} styles={tourStyles}>
      {children}
    </TourProvider>
  );
};

export default LoginTour;
