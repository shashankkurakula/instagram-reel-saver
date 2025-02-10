import React from "react";
import { Typography, Button } from "@mui/material";
import Modal from "./Modal";

const ProfileModal = ({ isOpen, onClose, handleLogout }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Typography variant="h6">Profile</Typography>
      <Button variant="contained" color="secondary" fullWidth onClick={handleLogout}>
        Logout
      </Button>
    </Modal>
  );
};

export default ProfileModal;
