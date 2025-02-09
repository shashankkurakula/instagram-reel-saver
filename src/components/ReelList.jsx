import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

const ReelList = ({ reels, setReels }) => {  // ✅ Ensure setReels is received from parent
  const [loading, setLoading] = useState(true);

  const fetchReels = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user?.id) return;

    // Fetch reels with related collections
    const { data: reelsData, error: reelsError } = await supabase
      .from("reels")
      .select("*, collections(name)")
      .eq("user_id", user.id);

    if (reelsError) {
      console.error("Error fetching reels:", reelsError);
      setLoading(false);
      return;
    }

    // Fetch tags for all reels
    const { data: reelTags, error: reelTagsError } = await supabase
      .from("reel_tags")
      .select("reel_id, tags(id, name)");

    if (reelTagsError) {
      console.error("Error fetching tags:", reelTagsError);
    }

    // Group tags by reel ID
    const tagsByReel = {};
    if (reelTags) {
      reelTags.forEach(({ reel_id, tags }) => {
        if (!tagsByReel[reel_id]) tagsByReel[reel_id] = [];
        tagsByReel[reel_id].push(tags.name);
      });
    }

    // Merge tags into reels
    const reelsWithTags = reelsData.map((reel) => ({
      ...reel,
      tags: tagsByReel[reel.id] || [], // Ensure tags is always an array
    }));

    setReels(reelsWithTags);
    setLoading(false);
  };

  useEffect(() => {
    fetchReels(); // Fetch reels initially

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("reels")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reels" }, (payload) => {
        console.log("New reel detected:", payload.new);
        setReels((prevReels) => [payload.new, ...prevReels]); // ✅ Update UI instantly
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={3} justifyContent="center">
        {reels.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center", width: "100%", mt: 3 }}>
            No reels found.
          </Typography>
        ) : (
          reels.map((reel) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={reel.id}>
              <Card sx={{ maxWidth: 350, boxShadow: 3 }}>
                {/* ✅ Check if reel.url exists before rendering iframe */}
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
                  <Typography color="error" sx={{ padding: 2 }}>Loading Reel...</Typography> // ✅ Temporary message while waiting
                )}
                <CardContent>
                  <Typography variant="h6">{reel.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection: {reel.collections?.name || "None"}
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
