// src/App.js

import React, { useEffect, useReducer, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import ThemeToggle from "./ThemeToggle";
import BackToTopButton from "./BackToTopButton";
import supabase from "./supabaseClient";
import ProtectedRoute from "./ProtectedRoute";
import { fetchPullRequests } from "./githubApi";
import { useToast } from "./ToastContext";
import "./App.css";

const GITHUB_OWNER = process.env.REACT_APP_GITHUB_OWNER;
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO;

const initialState = {
  isAuthenticating: true,
  user: null,
  userList: [],
  nameInput: "",
  displayNameInput: "",
  email: "",
  newTeam: "",
  newRole: "",
  githubUsername: "",
  userPullRequests: [],
  noteDate: new Date().toISOString().split("T")[0],
  // The old `noteText` is replaced by four new fields
  yesterdayText: "",
  todayText: "",
  blockersText: "",
  learningsText: "",
  userNotes: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_AUTHENTICATING":
      return { ...state, isAuthenticating: action.payload };
    case "RESET_NOTE_FORM":
      return {
        ...state,
        noteDate: new Date().toISOString().split("T")[0],
        yesterdayText: "",
        todayText: "",
        blockersText: "",
        learningsText: "",
      };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "CREATE_USER_SUCCESS":
      return {
        ...state, // <-- Make sure this is here
        nameInput: "",
        displayNameInput: "",
        email: "",
        newTeam: "",
        newRole: "",
        githubUsername: "",
        userList: [...state.userList, action.payload], // <-- And this
      };
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload };
    case "SET_NOTES":
      return { ...state, userNotes: action.payload };
    case "LOGOUT":
      return { ...state, user: null, userNotes: [], userPullRequests: [] };
    case "SET_USER_LIST":
      return { ...state, userList: action.payload };
    case "SET_PULL_REQUESTS":
      return { ...state, userPullRequests: action.payload };
    case "SUBMIT_NOTE_SUCCESS":
      return {
        ...state,
        // Clear the four new fields on successful submission
        yesterdayText: "",
        todayText: "",
        blockersText: "",
        learningsText: "",
        noteDate: new Date().toISOString().split("T")[0],
        userNotes: action.payload,
      };
    case "UPDATE_USER_SUCCESS":
      // When a single user is updated, we need to update BOTH the `user` object
      // for the logged-in user, AND that user's entry in the `userList`.
      return {
        ...state,
        user: action.payload, // Update the currently logged-in user's data
        // Find the user in the list and replace them with the updated data
        userList: state.userList.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    isAuthenticating,
    user,
    userList,
    nameInput,
    displayNameInput,
    email,
    newTeam,
    newRole,
    githubUsername,
    userPullRequests,
    noteDate,
    // Destructure our four new state variables instead of noteText
    yesterdayText,
    todayText,
    blockersText,
    learningsText,
    userNotes,
  } = state;

  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const handleQuickLogin = useCallback(
    async (username) => {
      // When we log in a new user, always reset the note form to its default state first.
      dispatch({ type: "RESET_NOTE_FORM" });
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();
      if (error || !userData) {
        addToast("Error logging in. Please try again.", "error");
        navigate("/");
        return;
      }
      dispatch({ type: "LOGIN_SUCCESS", payload: userData });
      const notes = await fetchNotesForUser(userData.id);
      dispatch({ type: "SET_NOTES", payload: notes });
      navigate(`/user/${userData.username}`);
    },
    [navigate, addToast]
  );

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Sanitize the username: convert to lowercase and remove spaces/special chars.
    const sanitizedUsername = nameInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ""); // Allows letters, numbers, and hyphens
    const newDisplayName = displayNameInput.trim();
    const newEmail = email.trim();

    if (
      !sanitizedUsername ||
      !newDisplayName ||
      !newEmail ||
      !newTeam ||
      !newRole
    ) {
      addToast(
        "Please fill out all required fields. Note that the username can only contain letters, numbers, and hyphens.",
        "error",
        "Validation Error"
      );
      return;
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", sanitizedUsername)
      .single();
    if (existingUser) {
      addToast("Username already exists. Please choose another.", "error");
      return;
    }
    const newUser = {
      username: sanitizedUsername, // Use the sanitized username for the database
      display_name: newDisplayName,
      email: newEmail,
      team: newTeam,
      role: newRole,
      github_username: githubUsername.trim() || null,
    };
    const { error } = await supabase.from("users").insert([newUser]);
    if (error) {
      addToast("Error creating user.", "error");
      console.error("Insert error:", error);
      return;
    }
    dispatch({ type: "CREATE_USER_SUCCESS", payload: newUser });
    addToast("User successfully created!", "success");
  };

  const handleLogout = () => {
    navigate("/"); // 1. Navigate to the home page first.
    dispatch({ type: "LOGOUT" }); // 2. Then, clear the user state.
  };

  const handleProfileUpdate = async (formData) => {
    if (!user) return; // Safety check

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        display_name: formData.display_name,
        email: formData.email,
        team: formData.team,
        role: formData.role,
        github_username: formData.github_username || null,
      })
      .eq("id", user.id)
      .select() // Use .select() to get the updated row back from the database
      .single();

    if (error) {
      addToast("Failed to update profile.", "error");
      console.error("Update error:", error);
      return;
    }

    // Dispatch an action with the updated user data to refresh the UI
    dispatch({ type: "UPDATE_USER_SUCCESS", payload: updatedUser });
    addToast("Profile updated successfully!", "success");
  };

  const handleSaveSelection = useCallback(
    async (selectedIds) => {
      if (!user) return;

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({ selected_user_ids: selectedIds })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        addToast("Failed to save selection.", "error");
        console.error("Update error:", error);
        return;
      }

      dispatch({ type: "UPDATE_USER_SUCCESS", payload: updatedUser });
      addToast("Selection saved automatically!", "success"); // Toast is back
    },
    [user, addToast]
  );

  const fetchNotesForUser = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("notes")
      // Select the new structured columns
      .select(
        "id, date, created_at, yesterday_text, today_text, blockers_text, learnings_text"
      )
      .eq("user_id", userId)
      .order("date", { ascending: false }); // Sort by the note's date
    if (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    const yesterday = yesterdayText.trim();
    const today = todayText.trim();
    const blockers = blockersText.trim();
    const learnings = learningsText.trim();

    // Validation: Ensure at least one field is filled out.
    if (!yesterday && !today && !blockers && !learnings) {
      addToast("Please fill out at least one field to save a note.", "error");
      return;
    }

    // "Upsert" logic: Check if a note for this user and date already exists.
    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", noteDate)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means "No rows found", which is not an error for us.
      console.error("Error checking for existing note:", fetchError);
      addToast("Error saving note.", "error");
      return;
    }

    let error;

    if (existingNote) {
      // If a note exists, UPDATE it.
      const { error: updateError } = await supabase
        .from("notes")
        .update({
          yesterday_text: yesterday,
          today_text: today,
          blockers_text: blockers,
          learnings_text: learnings,
        })
        .eq("id", existingNote.id);
      error = updateError;
    } else {
      // If no note exists, INSERT a new one.
      const { error: insertError } = await supabase.from("notes").insert([
        {
          user_id: user.id,
          date: noteDate,
          yesterday_text: yesterday,
          today_text: today,
          blockers_text: blockers,
          learnings_text: learnings,
        },
      ]);
      error = insertError;
    }

    if (error) {
      addToast("Failed to save note.", "error");
      console.error("Save error:", error);
      return;
    }

    const updatedNotes = await fetchNotesForUser(user.id);
    dispatch({ type: "SUBMIT_NOTE_SUCCESS", payload: updatedNotes });
    addToast("Note saved successfully!", "success");
  };

  // This effect pre-fills the note form when the date changes
  useEffect(() => {
    // Find a note in our userNotes array that matches the selected date
    const noteForSelectedDate = userNotes.find(
      (note) => note.date === noteDate
    );

    // If a note is found, fill the form fields with its data
    if (noteForSelectedDate) {
      dispatch({
        type: "SET_FIELD",
        field: "yesterdayText",
        value: noteForSelectedDate.yesterday_text || "",
      });
      dispatch({
        type: "SET_FIELD",
        field: "todayText",
        value: noteForSelectedDate.today_text || "",
      });
      dispatch({
        type: "SET_FIELD",
        field: "blockersText",
        value: noteForSelectedDate.blockers_text || "",
      });
      dispatch({
        type: "SET_FIELD",
        field: "learningsText",
        value: noteForSelectedDate.learnings_text || "",
      });
    } else {
      // If no note is found for that date, clear the form fields
      dispatch({ type: "SET_FIELD", field: "yesterdayText", value: "" });
      dispatch({ type: "SET_FIELD", field: "todayText", value: "" });
      dispatch({ type: "SET_FIELD", field: "blockersText", value: "" });
      dispatch({ type: "SET_FIELD", field: "learningsText", value: "" });
    }
  }, [noteDate, userNotes]); // Re-run this effect when the date or notes list changes

  useEffect(() => {
    const fetchUsers = async () => {
      // We now fetch all users when the app loads, not just on the login page.
      // We also crucially add 'id' to the select query.
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, username, team, role, github_username, email, display_name"
        )
        .order("display_name", { ascending: true }); // Let's sort by display_name now

      if (error) {
        console.error("Supabase fetch error:", error.message);
      } else {
        dispatch({ type: "SET_USER_LIST", payload: data });
      }
    };
    fetchUsers();
  }, []); // An empty dependency array ensures this runs only once on mount.

  // This effect runs once on app load to handle deep links
  useEffect(() => {
    // A function to check the URL and attempt to log in
    const authenticateFromUrl = async () => {
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      // In development, with BrowserRouter, pathParts might look like ['user', 'robert']
      // On Netlify, it might be ['echostatus', 'user', 'robert'] if basename was still there, but now it will be the same.
      const userIndex = pathParts.indexOf("user");

      // Check if the URL is a user-specific path
      if (userIndex !== -1 && pathParts.length > userIndex + 1) {
        const username = pathParts[userIndex + 1];
        if (username) {
          // If we have a username, call handleQuickLogin.
          // handleQuickLogin will fetch the user, set the state, and navigate.
          await handleQuickLogin(username);
        }
      }
      // VERY IMPORTANT: After the check is done, set authenticating to false.
      dispatch({ type: "SET_AUTHENTICATING", payload: false });
    };

    authenticateFromUrl();
    // We disable the linting rule here because we truly only want this
    // effect to run exactly once when the app first loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPRsForUser = async () => {
      if (!user || !user.github_username) {
        dispatch({ type: "SET_PULL_REQUESTS", payload: [] });
        return;
      }
      try {
        const allPRs = await fetchPullRequests(GITHUB_OWNER, GITHUB_REPO);
        const prs = allPRs.filter(
          (pr) =>
            pr.user?.login?.toLowerCase() === user.github_username.toLowerCase()
        );
        dispatch({ type: "SET_PULL_REQUESTS", payload: prs });
      } catch (err) {
        console.error("GitHub PR fetch failed:", err.message);
        dispatch({ type: "SET_PULL_REQUESTS", payload: [] });
      }
    };
    fetchPRsForUser();
  }, [user]);

  // Add a defensive check: only run reduce if userList is an array.
  const groupedUsers = Array.isArray(userList)
    ? userList.reduce((acc, u) => {
        if (!acc[u.team]) acc[u.team] = [];
        acc[u.team].push(u);
        return acc;
      }, {})
    : {}; // If userList isn't an array, default to an empty object.

  return (
    <div className="app-container">
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 1000,
        }}
      >
        <ThemeToggle />
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              groupedUsers={groupedUsers}
              handleQuickLogin={handleQuickLogin}
              handleCreateUser={handleCreateUser}
              nameInput={nameInput}
              displayNameInput={displayNameInput}
              email={email}
              newTeam={newTeam}
              newRole={newRole}
              githubUsername={githubUsername}
              dispatch={dispatch}
            />
          }
        />
        <Route
          path="/user/:username"
          element={
            <ProtectedRoute user={user} isAuthenticating={isAuthenticating}>
              <DashboardPage
                user={user}
                userList={userList}
                handleLogout={handleLogout}
                handleProfileUpdate={handleProfileUpdate}
                handleSaveSelection={handleSaveSelection}
                userPullRequests={userPullRequests}
                userNotes={userNotes}
                noteDate={noteDate}
                yesterdayText={yesterdayText}
                todayText={todayText}
                blockersText={blockersText}
                learningsText={learningsText}
                handleNoteSubmit={handleNoteSubmit}
                dispatch={dispatch}
              />
            </ProtectedRoute>
          }
        />
      </Routes>

      <BackToTopButton />
    </div>
  );
}

export default App;
