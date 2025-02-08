import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client"; // Updated import for React 18
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import SearchBar from "./components/SearchBar";
import { getReels } from "./db";
import "./styles.css";

const App = () => {
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReels = async () => {
      const savedReels = await getReels();
      setReels(savedReels);
      setLoading(false);
    };
    loadReels();
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">Instagram Reel Saver</h1>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ReelForm setReels={setReels} />
      {loading ? <p>Loading reels...</p> : <ReelList reels={reels} searchQuery={searchQuery} />}
    </div>
  );
};

// Render the app using React 18's createRoot API
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);