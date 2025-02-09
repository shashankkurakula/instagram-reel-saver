import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import ReelForm from "./components/ReelForm";
import ReelList from "./components/ReelList";
import Modal from "./components/Modal";
import { AppBar, Toolbar, Typography, IconButton, Container, Box, CircularProgress } from "@mui/material";
import { Search, Add, Refresh, AccountCircle } from "@mui/icons-material";

const App = () => {
  const [user, setUser] = useState(null);
  const [reels, setReels] = useState([]);
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
        setReels([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setReels([]);
    setIsProfileModalOpen(false);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <Box>
      {/* Header with Search, Refresh, Profile */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Reel Organizer
          </Typography>
          <IconButton color="inherit">
            <Search />
          </IconButton>
          <IconButton color="inherit" onClick={() => setReels([...reels])}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit" onClick={() => setIsProfileModalOpen(true)}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

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

      {/* Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
        <Typography variant="h6">Profile</Typography>
        <button onClick={handleLogout}>Logout</button>
      </Modal>
    </Box>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
