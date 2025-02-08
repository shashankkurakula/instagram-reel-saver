import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import SearchBar from "./components/SearchBar";
import Modal from "./components/Modal";
import { getReels } from "./db";
import "./styles.css";
import { FaSearch, FaPlus } from "react-icons/fa";

const App = () => {
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadReels = async () => {
      const savedReels = await getReels();
      setReels(savedReels);
      setLoading(false);
    };
    loadReels();
  }, []);

  const handleAddReel = (newReel) => {
    setReels((prev) => [...prev, newReel]);
    setIsModalOpen(false);
  };

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