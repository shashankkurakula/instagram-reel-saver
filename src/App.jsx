import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./config/supabase";
import Auth from "./components/Auth";
import ReelForm from "./components/reels/ReelForm";
import ReelList from "./components/reels/ReelList";
import Header from "./components/common/Header"; 
import Modal from "./components/common/Modal";
import ProfileModal from "./components/common/ProfileModal"; // ✅ Import new ProfileModal
import { Box, Container, CircularProgress, IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";

const App = () => {
  const [user, setUser] = useState(null);
  const [allReels, setAllReels] = useState([]);
  const [reels, setReels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setAllReels([]);
        setReels([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchReels = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("reels")
      .select("*, collections(name)");

    if (error) {
      console.error("Error fetching reels:", error);
    } else {
      setAllReels(data || []);
      setReels(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchReels();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setReels(allReels);
    } else {
      const filteredReels = allReels.filter((reel) =>
        reel.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setReels(filteredReels);
    }
  }, [searchQuery, allReels]);

  const handleReload = () => {
    fetchReels();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAllReels([]);
    setReels([]);
    setIsProfileModalOpen(false);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <Box>
      {/* ✅ Use Header Component */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleReload={handleReload}
        openProfile={() => setIsProfileModalOpen(true)}
      />

      <Container sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ReelList reels={reels} setReels={setReels} />
        )}
      </Container>

      <IconButton
        color="primary"
        sx={{ position: "fixed", bottom: 20, right: 20, backgroundColor: "blue", color: "white" }}
        onClick={() => setIsModalOpen(true)}
      >
        <Add />
      </IconButton>

      {/* Add Reel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReelForm setReels={setReels} closeModal={() => setIsModalOpen(false)} />
      </Modal>

      {/* ✅ Use new ProfileModal Component */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} handleLogout={handleLogout} />
    </Box>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
