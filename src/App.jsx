import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import Modal from "./components/Modal";
import { getReels } from "./db";
import "./styles.css";
import { FaSearch, FaPlus } from "react-icons/fa";

const App = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // ✅ Make sure setUser exists
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check for a session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user); // ✅ Set user state
        setSession(data.session);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user); // ✅ Update user state on login
      } else {
        setUser(null); // ✅ Remove user on logout
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
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
  }, [session]);

  // If there's no session, show the Auth component
  if (!user) {
    return <Auth setUser={setUser} />; // ✅ Pass setUser to Auth
  }

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
        <ReelForm setReels={setReels} />
      </Modal>
    </div>
  );
};

// Render the app using React 18's createRoot API
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
