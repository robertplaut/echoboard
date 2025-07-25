// src/TourContext.js
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect, // Make sure useEffect is imported
} from "react";

// 1. Create the context with a default value
const TourContext = createContext(null);

// 2. Create the Provider component that will wrap our app
export const TourProvider = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // START of code to ADD
  // This effect will run whenever isTourOpen changes.
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (isTourOpen) {
      // When the tour opens, add the scroll-lock class.
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.classList.add("tour-scroll-lock");
      document.body.classList.add("tour-scroll-lock");
    } else {
      // When the tour closes, remove the scroll-lock class.
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("tour-scroll-lock");
      document.body.classList.remove("tour-scroll-lock");
    }

    // Cleanup function in case the component unmounts while tour is open
    return () => {
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("tour-scroll-lock");
      document.body.classList.remove("tour-scroll-lock");
    };
  }, [isTourOpen]); // The dependency array ensures this runs only when needed.
  // END of code to ADD

  // Function to start a tour with a given set of steps
  const startTour = useCallback((tourSteps = []) => {
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsTourOpen(true);
  }, []);

  // Function to stop the tour
  const stopTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  // Function to go to the next step
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
    } else {
      stopTour(); // If it's the last step, stop the tour
    }
  }, [currentStepIndex, steps.length, stopTour]);

  // Function to go to the previous step
  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentStepIndex]);

  // We assemble all the state and functions into a 'value' object
  // that we'll provide to all children.
  const value = {
    isTourOpen,
    steps,
    currentStep: steps[currentStepIndex],
    currentStepIndex,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    startTour,
    stopTour,
    goToNextStep,
    goToPrevStep,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

// 3. Create a custom hook for easy consumption of the context
export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
