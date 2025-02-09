import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from './supabaseClient';
import Auth from "./components/Auth";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import Modal from "./components/Modal";
import { getReels, saveReel } from "./db";
import "./styles.css";
import { FaSearch, FaPlus } from "react-icons/fa";

const App = () => {
  const [session, setSession] = useState(null); // Track the user session
  const [reels, setReels] = useState([]); // Store reels
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [loading, setLoading] = useState(true); // Loading state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Check for a session on component mount
  useEffect(() => {
    // Fetch the current session
    const fetchSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    // Listen for auth state changes (e.g., user logs in or out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Load reels when the session is available
  useEffect(() => {
    if (session) {
      const loadReels = async () => {
        const savedReels = await getReels();
        setReels(savedReels);
        setLoading(false);
      };
      loadReels();
    }
  }, [session]); // Only run this effect when the session changes

  const handleAddReel = async (newReel) => {
    await saveReel(newReel); // Save to IndexedDB
    setReels((prev) => [...prev, newReel]); // Update local state
    setIsModalOpen(false); // Close the modal
  };

  // If there's no session, show the Auth component (login/signup)
  if (!session) {
    return <Auth />;
  }

  // If there's a session, show the main app (ReelForm and ReelList)
  return (
    <div className="app-container">
      <div className="header">
        <div className="search-bar-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search reels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </div>
        <FaPlus className="add-icon" onClick={() => setIsModalOpen(true)} />
      </div>

      {loading ? (
        <p className="loading">Loading reels...</p>
      ) : (
        <ReelList reels={reels} searchQuery={searchQuery} setReels={setReels} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Add New Reel</h2>
        <ReelForm setReels={handleAddReel} />
      </Modal>
    </div>
  );
};

// Render the app using React 18's createRoot API
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);