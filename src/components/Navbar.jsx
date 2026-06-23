import React, { useEffect, useState } from "react";
import {
  Dashboard,
  Logout,
  Settings,
  Bolt,
  Construction,
  ElectricalServices,
  RateReview,
  ContactMail,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box, Typography, useMediaQuery, Paper } from "@mui/material";
import Header from "./Header/Header";

const BRAND_BLUE = "#1a5fb4";
const BRAND_BLUE_DARK = "#134a8c";
const BRAND_GOLD = "#f5c518";

const drawerWidth = 260;
const drawerClosedWidth = 92;
export const APP_BAR_HEIGHT = 64;

const topBarSx = {
  height: APP_BAR_HEIGHT,
  minHeight: APP_BAR_HEIGHT,
  maxHeight: APP_BAR_HEIGHT,
  boxSizing: "border-box",
  background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
  boxShadow: `inset 0 -3px 0 ${BRAND_GOLD}`,
};

const NAV_LINKS = [
  {
    text: "Dashboard",
    icon: Dashboard,
    path: "/analytics",
    paths: ["/analytics", "/home"],
  },
  {
    text: "Projects",
    icon: Construction,
    path: "/projects",
    paths: ["/projects"],
  },
  {
    text: "Services",
    icon: ElectricalServices,
    path: "/services",
    paths: ["/services"],
  },
  {
    text: "Reviews",
    icon: RateReview,
    path: "/reviews",
    paths: ["/reviews"],
  },
  {
    text: "Inquiries",
    icon: ContactMail,
    path: "/inquiries",
    paths: ["/inquiries"],
  },
  {
    text: "Settings",
    icon: Settings,
    path: "/settings",
    paths: ["/settings"],
  },
];

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: drawerClosedWidth,
});

const DrawerHeader = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: open ? "space-between" : "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0, open ? 0.5 : 0),
  flexShrink: 0,
  overflow: "hidden",
  ...topBarSx,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "docked",
})(({ theme, open, docked }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...topBarSx,
  boxShadow: `0 4px 24px rgba(26, 95, 180, 0.35), inset 0 -3px 0 ${BRAND_GOLD}`,
  "& .MuiToolbar-root": {
    minHeight: `${APP_BAR_HEIGHT}px !important`,
    height: APP_BAR_HEIGHT,
    maxHeight: APP_BAR_HEIGHT,
    paddingTop: 0,
    paddingBottom: 0,
  },
  ...(docked && {
    marginLeft: open ? drawerWidth : drawerClosedWidth,
    width: `calc(100% - ${open ? drawerWidth : drawerClosedWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : drawerClosedWidth,
  flexShrink: 0,
  whiteSpace: open ? "nowrap" : "normal",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      display: "flex",
      flexDirection: "column",
      borderRight: `1px solid rgba(26, 95, 180, 0.12)`,
      background: "linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%)",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      display: "flex",
      flexDirection: "column",
      borderRight: `1px solid rgba(26, 95, 180, 0.12)`,
      background: "linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%)",
    },
  }),
}));

const isPathActive = (paths, pathname) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const iconTileSx = (active, { isLogout = false, size = 42 } = {}) => ({
  width: size,
  height: size,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  ...(active && !isLogout
    ? {
        background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
        boxShadow: "0 4px 12px rgba(26,95,180,0.28)",
      }
    : {
        bgcolor: isLogout ? "rgba(198, 40, 40, 0.1)" : "rgba(26, 95, 180, 0.08)",
      }),
});

const iconColor = (active, isLogout = false) => {
  if (isLogout) return "#c62828";
  if (active) return "#ffffff";
  return BRAND_BLUE;
};

const NavItemButton = ({ item, active, open, onClick }) => {
  const Icon = item.icon;

  if (!open) {
    return (
      <ListItemButton
        onClick={onClick}
        sx={{
          mx: 0.75,
          mb: 0.75,
          borderRadius: 2,
          py: 1.25,
          px: 0.5,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          minHeight: 76,
          position: "relative",
          color: "inherit",
          ...(active && {
            bgcolor: "rgba(26, 95, 180, 0.06)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              height: 3,
              borderRadius: 2,
              bgcolor: BRAND_GOLD,
            },
          }),
          "&:hover": { bgcolor: "rgba(26, 95, 180, 0.08)" },
        }}
      >
        <Box sx={iconTileSx(active)}>
          <Icon sx={{ fontSize: 24, color: iconColor(active) }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: active ? 700 : 600,
            fontSize: "0.58rem",
            color: active ? BRAND_BLUE : "text.secondary",
            textAlign: "center",
            lineHeight: 1.2,
            width: "100%",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {item.text}
        </Typography>
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        mx: 1,
        mb: 0.5,
        borderRadius: 2,
        minHeight: 48,
        position: "relative",
        overflow: "hidden",
        color: "inherit",
        ...(active && {
          bgcolor: "rgba(26, 95, 180, 0.1)",
          borderLeft: `4px solid ${BRAND_GOLD}`,
        }),
        "&:hover": { bgcolor: "rgba(26, 95, 180, 0.06)" },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: active ? BRAND_BLUE : "text.secondary",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </ListItemIcon>
      <ListItemText
        primary={item.text}
        primaryTypographyProps={{
          fontWeight: active ? 700 : 600,
          fontSize: "0.9rem",
          color: active ? BRAND_BLUE : "text.primary",
        }}
      />
    </ListItemButton>
  );
};

const LogoutNavButton = ({ open, onClick }) => {
  if (!open) {
    return (
      <ListItemButton
        onClick={onClick}
        sx={{
          mx: 0.75,
          borderRadius: 2,
          py: 1.25,
          px: 0.5,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          minHeight: 76,
          border: "1px solid rgba(198, 40, 40, 0.2)",
          bgcolor: "rgba(198, 40, 40, 0.04)",
          "&:hover": { bgcolor: "rgba(198, 40, 40, 0.1)" },
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: "rgba(198, 40, 40, 0.1)",
          }}
        >
          <Logout sx={{ fontSize: 24, color: "#c62828" }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.58rem",
            color: "#c62828",
            textAlign: "center",
            lineHeight: 1.2,
            width: "100%",
          }}
        >
          Logout
        </Typography>
      </ListItemButton>
    );
  }

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        mx: 1,
        borderRadius: 2,
        minHeight: 48,
        border: "1px solid rgba(198, 40, 40, 0.2)",
        bgcolor: "rgba(198, 40, 40, 0.04)",
        "&:hover": { bgcolor: "rgba(198, 40, 40, 0.1)" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: "#c62828", justifyContent: "center" }}>
        <Logout sx={{ fontSize: 22 }} />
      </ListItemIcon>
      <ListItemText
        primary="Logout"
        primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem", color: "#c62828" }}
      />
    </ListItemButton>
  );
};

const BottomNavItem = ({ label, icon: Icon, active, isLogout, onClick }) => (
  <Box
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 0.75,
      px: 0.25,
      cursor: "pointer",
      userSelect: "none",
      position: "relative",
      transition: "transform 0.2s ease",
      "&:active": { transform: "scale(0.95)" },
    }}
  >
    {active && !isLogout && (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 24,
          height: 3,
          borderRadius: 2,
          bgcolor: BRAND_GOLD,
        }}
      />
    )}
    <Box sx={iconTileSx(active, { isLogout, size: 40 })}>
      <Icon sx={{ fontSize: 22, color: iconColor(active, isLogout) }} />
    </Box>
    <Typography
      variant="caption"
      noWrap
      sx={{
        fontWeight: active ? 700 : 600,
        fontSize: "0.62rem",
        color: active ? (isLogout ? "#c62828" : BRAND_BLUE) : "text.secondary",
        lineHeight: 1.2,
        textAlign: "center",
        maxWidth: "100%",
        mt: 0.25,
      }}
    >
      {label}
    </Typography>
  </Box>
);

const Navbar = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(() => window.innerWidth >= theme.breakpoints.values.md);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    fetch("/api/admin-users/logout", { method: "GET", credentials: "include" });
  };

  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= theme.breakpoints.values.md);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.breakpoints.values.md]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} docked={!isSmallScreen}>
        <Toolbar disableGutters sx={{ px: { xs: 1.5, md: 2 }, py: 0 }}>
          {isSmallScreen && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1, flexShrink: 0 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="SafeWire"
                sx={{ height: 32, width: "auto" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.1, color: "#fff" }}>
                  SafeWire
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: BRAND_GOLD, fontWeight: 600 }}>
                  Electrical
                </Typography>
              </Box>
            </Box>
          )}
          <Header setUser={props.setUser} handleDrawerOpen={handleDrawerOpen} open={open} />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open} sx={{ display: { xs: "none", md: "block" } }}>
        <DrawerHeader open={open}>
          {open ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                  minWidth: 0,
                  pl: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="SafeWire"
                  sx={{ height: 32, width: "auto", flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontWeight: 800, color: "#fff", fontSize: "0.85rem", lineHeight: 1.15 }}
                  >
                    SafeWire Electrical
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ fontSize: "0.65rem", color: BRAND_GOLD, fontWeight: 600, lineHeight: 1.15 }}
                  >
                    Admin Portal
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleDrawerClose}
                size="small"
                aria-label="collapse drawer"
                sx={{
                  color: "#fff",
                  flexShrink: 0,
                  mr: 0.25,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={handleDrawerOpen}
              aria-label="expand drawer"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                border: `2px solid ${BRAND_GOLD}`,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Bolt sx={{ color: BRAND_GOLD, fontSize: 20 }} />
            </IconButton>
          )}
        </DrawerHeader>

        <List sx={{ px: open ? 0.5 : 0.25, flex: 1, pt: 1 }}>
          {NAV_LINKS.map((item) => (
            <NavItemButton
              key={item.text}
              item={item}
              open={open}
              active={isPathActive(item.paths, location.pathname)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </List>

        <Box sx={{ p: open ? 1 : 0.75, mt: "auto" }}>
          <LogoutNavButton open={open} onClick={logout} />
        </Box>
      </Drawer>

      {isSmallScreen && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 1,
            display: { xs: "block", md: "none" },
            borderRadius: "20px 20px 0 0",
            borderTop: `3px solid ${BRAND_GOLD}`,
            background: "linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%)",
            boxShadow: "0 -10px 40px rgba(26, 95, 180, 0.18)",
            pb: "max(env(safe-area-inset-bottom), 4px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 64 }}>
            {NAV_LINKS.map((item) => (
              <BottomNavItem
                key={item.text}
                label={item.text}
                icon={item.icon}
                active={isPathActive(item.paths, location.pathname)}
                onClick={() => navigate(item.path)}
              />
            ))}
            <BottomNavItem label="Logout" icon={Logout} isLogout onClick={logout} />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Navbar;
