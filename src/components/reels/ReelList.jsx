import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { Card, CardContent, Typography, Grid, Box, IconButton, Menu, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Sort, FilterList, ViewModule } from "@mui/icons-material";

const ReelList = ({ reels, setReels }) => {
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("date");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDelete = async (reelId) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;

    const { error } = await supabase.from("reels").delete().eq("id", reelId);

    if (error) {
      console.error("Error deleting reel:", error);
      alert("Failed to delete reel.");
      return;
    }

    setReels((prev) => prev.filter((reel) => reel.id !== reelId));
  };

  const fetchReels = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user?.id) return;

    const { data: reelsData, error: reelsError } = await supabase
      .from("reels")
      .select("*, collections(name)")
      .eq("user_id", user.id);

    if (reelsError) {
      console.error("Error fetching reels:", reelsError);
      setLoading(false);
      return;
    }

    const { data: reelTags, error: reelTagsError } = await supabase
      .from("reel_tags")
      .select("reel_id, tags(id, name)");

    if (reelTagsError) {
      console.error("Error fetching tags:", reelTagsError);
    }

    const tagsByReel = {};
    if (reelTags) {
      reelTags.forEach(({ reel_id, tags }) => {
        if (!tagsByReel[reel_id]) tagsByReel[reel_id] = [];
        tagsByReel[reel_id].push(tags.name);
      });
    }

    const reelsWithTags = reelsData.map((reel) => ({
      ...reel,
      tags: tagsByReel[reel.id] || [],
    }));

    setReels(reelsWithTags);
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();

    const subscription = supabase
      .channel("reels")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reels" },
        (payload) => {
          console.log("New reel detected:", payload.new);
          setReels((prevReels) => [payload.new, ...prevReels]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    let sortedReels = [...reels];

    switch (sortOption) {
      case "date":
        sortedReels.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "tag":
        sortedReels.sort((a, b) => (a.tags?.[0] || "").localeCompare(b.tags?.[0] || ""));
        break;
      case "title":
        sortedReels.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setReels(sortedReels);
  }, [sortOption, reels]);

  return (
    <Box sx={{ padding: 2 }}>
      {/* Sort, Filter, and View Toggle UI */}
      <Box sx={{ display: "flex", justifyContent: "space-between", padding: 1, bgcolor: "white" }}>
        {/* Sort Button */}
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Sort />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setSortOption("date")}>Sort by Date</MenuItem>
          <MenuItem onClick={() => setSortOption("tag")}>Sort by Tag Name</MenuItem>
          <MenuItem onClick={() => setSortOption("title")}>Sort by Title</MenuItem>
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

      {/* Reel Grid */}
      <Grid container spacing={3} justifyContent="center">
        {reels.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center", width: "100%", mt: 3 }}>
            No reels found.
          </Typography>
        ) : (
          reels.map((reel) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={reel.id}>
              <Card sx={{ maxWidth: 350, boxShadow: 3, position: "relative" }}>
                <IconButton sx={{ position: "absolute", top: 5, right: 5, color: "red" }} onClick={() => handleDelete(reel.id)}>
                  <DeleteIcon />
                </IconButton>

                {reel.url && reel.url.includes("/reel/") ? (
                  <iframe
                    src={`https://www.instagram.com/reel/${reel.url.split("/reel/")[1]?.split("/")[0]}/embed`}
                    title={reel.title}
                    width="100%"
                    height="180"
                    frameBorder="0"
                    scrolling="no"
                    style={{ borderRadius: "8px" }}
                  ></iframe>
                ) : (
                  <Typography color="error" sx={{ padding: 2 }}>Reel Not Available</Typography>
                )}
                <CardContent>
                  <Typography variant="h6">{reel.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection: {reel.collections?.name || "None"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tags: {reel.tags?.join(", ") || "No Tags"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default ReelList;
