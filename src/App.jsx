import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import Modal from "./components/Modal";
import { getReels } from "./db";
import "./styles.css";
import { FaSearch, FaPlus, FaRedo, FaUser } from "react-icons/fa"; // 🔄 Refresh & 👤 Profile icons

const App = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // 👤 Profile modal

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        setSession(data.session);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const savedReels = await getReels();
    setReels(savedReels);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchReels();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsProfileModalOpen(false); // ✅ Close profile modal on logout
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div className="app-container">
      {/* 🔍 Search, 🔄 Refresh, 👤 Profile Row */}
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
        <FaRedo className="refresh-icon" onClick={fetchReels} title="Refresh" /> {/* 🔄 Refresh Button */}
        <FaUser className="profile-icon" onClick={() => setIsProfileModalOpen(true)} title="Profile" /> {/* 👤 Profile Button */}
      </div>

      {loading ? (
        <p className="loading">Loading reels...</p>
      ) : (
        <ReelList reels={reels} searchQuery={searchQuery} setReels={setReels} />
      )}

      {/* 📌 Floating Add Reel Button */}
      <FaPlus className="add-icon" onClick={() => setIsModalOpen(true)} />

      {/* 📌 Add Reel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Add New Reel</h2>
        <ReelForm setReels={setReels} closeModal={() => setIsModalOpen(false)} />
      </Modal>

      {/* 👤 Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
        <h2>Profile</h2>
        <button className="profile-btn" onClick={() => alert("Profile feature coming soon!")}>Profile</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </Modal>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
