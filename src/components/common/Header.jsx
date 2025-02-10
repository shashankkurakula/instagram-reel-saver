import React from "react";
import { AppBar, Toolbar, Typography, IconButton, TextField } from "@mui/material";
import { Search, Refresh, AccountCircle } from "@mui/icons-material";

const Header = ({ searchQuery, setSearchQuery, handleReload, openProfile }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Reel Organizer
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search reels..."
          size="small"
          sx={{ bgcolor: "white", borderRadius: 1, mr: 2 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton color="inherit" onClick={handleReload}>
          <Refresh />
        </IconButton>
        <IconButton color="inherit" onClick={openProfile}>
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
