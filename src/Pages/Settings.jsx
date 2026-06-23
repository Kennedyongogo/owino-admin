import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  cardSx,
  fieldSx,
  primaryButtonSx,
  formatStatus,
  buildImageUrl,
} from "../components/Projects/projectTheme";

const cardHeaderSx = {
  ...headerGradient,
  px: { xs: 2, sm: 3 },
  py: { xs: 2, sm: 2.5 },
  position: "relative",
  overflow: "hidden",
};

const headerOrbSx = {
  position: "absolute",
  borderRadius: "50%",
  bgcolor: "rgba(255,255,255,0.08)",
  pointerEvents: "none",
};

const iconBadgeSx = {
  p: 1.25,
  borderRadius: 2,
  bgcolor: "rgba(255,255,255,0.15)",
  border: `2px solid rgba(245,197,24,0.45)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const criteriaMetColor = "#2e7d32";
const criteriaPendingColor = "text.secondary";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const SettingsCardHeader = ({ icon: Icon, title, subtitle }) => (
  <Box sx={cardHeaderSx}>
    <Box sx={{ ...headerOrbSx, top: -40, right: -30, width: 140, height: 140 }} />
    <Box sx={{ ...headerOrbSx, bottom: -50, left: -20, width: 110, height: 110 }} />
    <Stack direction="row" alignItems="center" spacing={1.75} sx={{ position: "relative", zIndex: 1 }}>
      <Box sx={iconBadgeSx}>
        <Icon sx={{ fontSize: 26, color: BRAND_GOLD }} />
      </Box>
      <Box minWidth={0}>
        <Typography variant="h6" fontWeight={800} color="#fff" sx={{ lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)", mt: 0.25 }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

export default function Settings({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    Name: user?.name || "",
    Email: user?.email || "",
    PhoneNumber: user?.phone || "",
    Role: user?.role || "",
  });
  const [currentUser, setCurrentUser] = useState(user);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState("success");
  const [dloading, setDLoading] = useState(false);
  const [ploading, setPLoading] = useState(false);
  const [usr, setUsr] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const checkPasswordCriteria = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    checkPasswordCriteria(newPassword);
  }, [newPassword]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`/api/admins/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success && data.data) {
          setCurrentUser(data.data);
          setUserData({
            Name: data.data.name || "",
            Email: data.data.email || "",
            PhoneNumber: data.data.phone || "",
            Role: data.data.role || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user?.id) fetchUserData();
  }, [user?.id]);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setUsr(false);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setSeverity("error");
      return;
    }

    if (
      !passwordCriteria.digit ||
      !passwordCriteria.length ||
      !passwordCriteria.lowercase ||
      !passwordCriteria.special ||
      !passwordCriteria.uppercase
    ) {
      setMessage("Enter a strong password!");
      setSeverity("error");
      return;
    }

    setPLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found");
        setSeverity("error");
        setPLoading(false);
        return;
      }

      const response = await fetch(`/api/admins/${user?.id}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage("Password updated successfully.");
        setSeverity("success");
        setTimeout(() => {
          setMessage(null);
          navigate("/");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to update password.");
        setSeverity("error");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update password.");
      setSeverity("error");
      setTimeout(() => setMessage(null), 3000);
    }
    setPLoading(false);
  };

  const handleUserUpdate = async () => {
    setDLoading(true);
    setUsr(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found");
        setSeverity("error");
        setDLoading(false);
        return;
      }

      const response = await fetch(`/api/admins/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.Name,
          email: userData.Email,
          phone: userData.PhoneNumber,
          role: userData.Role,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.data);
        const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), ...data.data };
        delete updated.password;
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("admin-user-updated", { detail: updated }));
        setMessage(data.message || "User details updated successfully.");
        setSeverity("success");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(data.message || "Failed to update user details.");
        setSeverity("error");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Failed to update user details.");
      setSeverity("error");
      setTimeout(() => setMessage(null), 3000);
    }
    setDLoading(false);
  };

  const profileFields = [
    { field: "Name", label: "Full name", icon: PersonIcon, disabled: false },
    { field: "Email", label: "Email", icon: EmailIcon, disabled: true },
    { field: "PhoneNumber", label: "Phone", icon: PhoneIcon, disabled: false },
    { field: "Role", label: "Role", icon: WorkIcon, disabled: true, format: formatStatus },
  ];

  const renderPasswordField = (label, fieldKey, value, onChange, extraOnChange) => (
    <FormControl fullWidth sx={fieldSx}>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        label={label}
        type={showPasswords[fieldKey] ? "text" : "password"}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          extraOnChange?.(e);
        }}
        startAdornment={
          <InputAdornment position="start">
            <LockIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.75 }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Tooltip title={showPasswords[fieldKey] ? "Hide password" : "Show password"}>
              <IconButton
                onClick={() => togglePasswordVisibility(fieldKey)}
                edge="end"
                size="small"
                sx={{ color: BRAND_BLUE }}
              >
                {showPasswords[fieldKey] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
      />
    </FormControl>
  );

  const criteriaItems = [
    { key: "length", text: "At least 8 characters long" },
    { key: "uppercase", text: "At least one uppercase letter" },
    { key: "lowercase", text: "At least one lowercase letter" },
    { key: "digit", text: "At least one digit" },
    { key: "special", text: "At least one special character" },
  ];

  const metCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;

  return (
    <Box sx={{ ...pageBackground, minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ borderRadius: 0, minHeight: "100vh", bgcolor: "transparent" }}>
        {/* Header Section */}
        <Box sx={{ ...headerGradient, px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, sm: 3 }, position: "relative", overflow: "hidden" }}>
          <Box sx={{ ...headerOrbSx, top: -55, right: -40, width: 180, height: 180 }} />
          <Box sx={{ ...headerOrbSx, bottom: -45, left: -25, width: 130, height: 130 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
              <Avatar
                src={currentUser?.profile_picture ? buildImageUrl(currentUser.profile_picture) : undefined}
                alt={currentUser?.name || "Profile"}
                imgProps={{ style: { objectFit: "cover" } }}
                sx={{
                  width: { xs: 52, sm: 56 },
                  height: { xs: 52, sm: 56 },
                  bgcolor: BRAND_BLUE,
                  border: `3px solid ${BRAND_GOLD}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  fontWeight: 800,
                }}
              >
                {getInitials(currentUser?.name || user?.name)}
              </Avatar>
              <Box minWidth={0}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <SettingsIcon sx={{ color: BRAND_GOLD, fontSize: 22 }} />
                  <Typography variant="h4" fontWeight={800} color="#fff" sx={{ fontSize: { xs: "1.45rem", sm: "2rem" } }}>
                    Account Settings
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                  Manage your profile and security settings
                </Typography>
              </Box>
            </Stack>
            <Chip
              icon={<WorkIcon sx={{ color: `${BRAND_BLUE_DARK} !important` }} />}
              label={formatStatus(userData.Role || user?.role || "admin")}
              sx={{
                bgcolor: BRAND_GOLD,
                color: BRAND_BLUE_DARK,
                fontWeight: 800,
                border: "2px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                "& .MuiChip-icon": { color: BRAND_BLUE_DARK },
              }}
            />
          </Stack>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: 920, mx: "auto", width: "100%", boxSizing: "border-box" }}>
          <Stack spacing={3}>
            {/* User Details Card */}
            <Card
              sx={{
                ...cardSx,
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
                "&:hover": { boxShadow: "0 14px 40px rgba(26,95,180,0.14)" },
              }}
            >
              <SettingsCardHeader
                icon={PersonIcon}
                title="Profile Information"
                subtitle="Update your personal details"
              />
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  {profileFields.map(({ field, label, icon: Icon, disabled, format }) => (
                    <FormControl key={field} fullWidth sx={fieldSx}>
                      <InputLabel>{label}</InputLabel>
                      <OutlinedInput
                        label={label}
                        value={format ? format(userData[field]) : userData[field]}
                        disabled={disabled}
                        onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <Icon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: disabled ? 0.45 : 0.75 }} />
                          </InputAdornment>
                        }
                        sx={{
                          bgcolor: disabled ? "rgba(26,95,180,0.04)" : "#fff",
                        }}
                      />
                    </FormControl>
                  ))}

                  {usr && message && (
                    <Alert severity={severity} sx={{ borderRadius: 2, fontWeight: 600 }}>
                      {message}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
              <Divider sx={{ borderColor: "rgba(26,95,180,0.1)" }} />
              <CardActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: { xs: "stretch", sm: "flex-end" } }}>
                <Button
                  variant="contained"
                  onClick={handleUserUpdate}
                  disabled={dloading}
                  fullWidth
                  startIcon={dloading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ ...primaryButtonSx, px: 4, py: 1.25, maxWidth: { sm: 220 } }}
                >
                  {dloading ? "Updating..." : "Update Profile"}
                </Button>
              </CardActions>
            </Card>

            {/* Password Update Card */}
            <form onSubmit={handlePasswordUpdate}>
              <Card
                sx={{
                  ...cardSx,
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  "&:hover": { boxShadow: "0 14px 40px rgba(26,95,180,0.14)" },
                }}
              >
                <SettingsCardHeader
                  icon={SecurityIcon}
                  title="Security Settings"
                  subtitle="Update your password for better security"
                />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        borderRadius: 2.5,
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: "rgba(26,95,180,0.04)",
                        border: "1px solid rgba(26,95,180,0.12)",
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1.25}>
                        <Typography variant="subtitle2" fontWeight={800} color={BRAND_BLUE_DARK} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <LockIcon fontSize="small" sx={{ color: BRAND_BLUE }} />
                          Password requirements
                        </Typography>
                        <Chip
                          size="small"
                          label={`${metCriteriaCount}/5 met`}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            bgcolor: metCriteriaCount === 5 ? "rgba(46,125,50,0.12)" : "rgba(245,197,24,0.2)",
                            color: metCriteriaCount === 5 ? criteriaMetColor : "#9a7b00",
                          }}
                        />
                      </Stack>
                      <List dense disablePadding>
                        {criteriaItems.map(({ key, text }) => {
                          const met = passwordCriteria[key];
                          return (
                            <ListItem key={key} sx={{ py: 0.35, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {met ? (
                                  <Check sx={{ color: criteriaMetColor, fontSize: 18 }} />
                                ) : (
                                  <Close sx={{ color: "rgba(26,95,180,0.35)", fontSize: 18 }} />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={text}
                                primaryTypographyProps={{
                                  fontSize: "0.875rem",
                                  color: met ? criteriaMetColor : criteriaPendingColor,
                                  fontWeight: met ? 700 : 500,
                                }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>

                    {renderPasswordField("Current password", "oldPassword", oldPassword, setOldPassword)}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        {renderPasswordField("New password", "newPassword", newPassword, setNewPassword)}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {renderPasswordField(
                          "Confirm password",
                          "confirmPassword",
                          confirmPassword,
                          setConfirmPassword,
                          (e) => {
                            if (e.target.value !== newPassword) {
                              setMessage("Passwords do not match");
                              setSeverity("error");
                            } else setMessage("");
                          }
                        )}
                      </Grid>
                    </Grid>

                    {!usr && message && (
                      <Alert severity={severity} sx={{ borderRadius: 2, fontWeight: 600 }}>
                        {message}
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
                <Divider sx={{ borderColor: "rgba(26,95,180,0.1)" }} />
                <CardActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: { xs: "stretch", sm: "flex-end" } }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={ploading}
                    fullWidth
                    startIcon={ploading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
                    sx={{ ...primaryButtonSx, px: 4, py: 1.25, maxWidth: { sm: 240 } }}
                  >
                    {ploading ? "Updating..." : "Update Password"}
                  </Button>
                </CardActions>
              </Card>
            </form>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
