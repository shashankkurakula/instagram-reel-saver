import React, { useState } from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { Sort, FilterList, ViewModule } from "@mui/icons-material";

const SortFilterView = ({ setSortOption }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortSelect = (option) => {
    setSortOption(option);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", padding: 1, bgcolor: "white" }}>
      {/* Sort Button */}
      <IconButton onClick={handleSortClick}>
        <Sort />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleSortSelect("date")}>Sort by Date</MenuItem>
        <MenuItem onClick={() => handleSortSelect("tag")}>Sort by Tag Name</MenuItem>
        <MenuItem onClick={() => handleSortSelect("title")}>Sort by Title</MenuItem>
      </Menu>

      {/* Filter Button (Dummy for now) */}
      <IconButton>
        <FilterList />
      </IconButton>

      {/* View Toggle Button (Dummy for now) */}
      <IconButton>
        <ViewModule />
      </IconButton>
    </Box>
  );
};

export default SortFilterView;
