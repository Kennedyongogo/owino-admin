import React, { useEffect, useState, Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar, { APP_BAR_HEIGHT } from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Projects from "./Projects/Projects";
import Services from "./Services/Services";
import Reviews from "./Reviews/Reviews";
import Inquiries from "./Inquiries/Inquiries";
import Users from "./Users/Users";
import ProjectView from "./Projects/ProjectView";
import ProjectEdit from "./Projects/ProjectEdit";
import Analytics from "./Analytics/Analytics";

const ProjectCreate = lazy(() => import("./Projects/ProjectCreate"));

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const onUserUpdated = (event) => {
      if (event.detail) setUser(event.detail);
    };
    window.addEventListener("admin-user-updated", onUserUpdated);
    return () => window.removeEventListener("admin-user-updated", onUserUpdated);
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: `${APP_BAR_HEIGHT}px`,
          pb: { xs: 10, sm: 3 },
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Routes>
              <Route path="home" element={<Navigate to="/analytics" replace />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/create" element={<ProjectCreate />} />
              <Route path="projects/:id" element={<ProjectView />} />
              <Route path="projects/:id/edit" element={<ProjectEdit />} />
              <Route path="services" element={<Services />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings user={user} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
