import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoadingScreen = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 1)",
      zIndex: 1300,
    }}
  >
    <CircularProgress />
  </Box>
);

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return imageUrl;
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function Header(props) {
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      props.setUser(userData);
      setLoading(false);
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const onUserUpdated = (event) => {
      if (!event.detail) return;
      setCurrentUser(event.detail);
      props.setUser(event.detail);
    };

    window.addEventListener("admin-user-updated", onUserUpdated);
    return () => window.removeEventListener("admin-user-updated", onUserUpdated);
  }, [props]);

  return (
    <>
      {loading && <LoadingScreen />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          py: 0,
          px: 0,
          color: "white",
          width: "100%",
          height: "100%",
          minHeight: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              display: { xs: "none", sm: "block" },
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentUser?.name}
          </Typography>

          <Avatar
            key={currentUser?.profile_picture || currentUser?.id || "avatar"}
            src={currentUser?.profile_picture ? buildImageUrl(currentUser.profile_picture) : undefined}
            alt={currentUser?.name || "Profile"}
            imgProps={{ style: { objectFit: "cover" } }}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              border: "2px solid rgba(245, 197, 24, 0.85)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.9rem",
            }}
          >
            {getInitials(currentUser?.name)}
          </Avatar>
        </Box>
      </Box>
    </>
  );
}
