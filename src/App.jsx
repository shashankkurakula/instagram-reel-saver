import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import Modal from "./components/Modal";
import { FaSearch, FaPlus, FaRedo, FaUser } from "react-icons/fa"; // 🔄 Refresh & 👤 Profile icons
import "./styles.css";

const App = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ✅ Fetch session and user on mount
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
        setReels([]); // ✅ Clear reels on logout
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ✅ Fetch reels immediately after login
  useEffect(() => {
    const fetchReels = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("reels")
        .select("*, collections(name)");

      if (error) {
        console.error("Error fetching reels:", error);
      } else {
        setReels(data || []);
      }

      setLoading(false);
    };

    fetchReels();
  }, [user]); // ✅ Runs when `user` changes (on login)

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setReels([]); // ✅ Clear reels on logout
    setIsProfileModalOpen(false);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
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
        <FaRedo className="refresh-icon" onClick={() => setReels([]) || setUser(user)} title="Refresh" />
        <FaUser className="profile-icon" onClick={() => setIsProfileModalOpen(true)} title="Profile" />
      </div>

      {loading ? (
        <p className="loading">Loading reels...</p>
      ) : (
        <ReelList reels={reels} searchQuery={searchQuery} setReels={setReels} />
      )}

      <FaPlus className="add-icon" onClick={() => setIsModalOpen(true)} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Add New Reel</h2>
        <ReelForm setReels={setReels} closeModal={() => setIsModalOpen(false)} />
      </Modal>

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
