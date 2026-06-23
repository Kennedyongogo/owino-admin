import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Switch,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  VisibilityOff,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  People as UsersIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Schedule as ScheduleIcon,
  Engineering as EngineerIcon,
  ManageAccounts as ManagerIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  PhotoCamera as UploadIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  primaryButtonSx,
  fieldSx,
  formatStatus,
} from "../Projects/projectTheme";

const ROLE_OPTIONS = [
  { value: "engineer", label: "Engineer", hint: "Technical & field access", Icon: EngineerIcon },
  { value: "project_manager", label: "Project Manager", hint: "Projects & coordination", Icon: ManagerIcon },
  { value: "super_admin", label: "Super Admin", hint: "Full portal control", Icon: AdminIcon },
];

const roleChipSx = {
  engineer: { bg: "rgba(26, 95, 180, 0.12)", color: BRAND_BLUE },
  project_manager: { bg: "rgba(245, 197, 24, 0.2)", color: "#9a7b00" },
  super_admin: { bg: "rgba(46, 125, 50, 0.12)", color: "#2e7d32" },
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "engineer",
  password: "",
  isActive: true,
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return imageUrl;
};

const syncLoggedInUser = (adminData) => {
  if (!adminData?.id) return;
  try {
    const current = JSON.parse(localStorage.getItem("user") || "{}");
    if (current.id !== adminData.id) return;
    const updated = { ...current, ...adminData };
    delete updated.password;
    localStorage.setItem("user", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("admin-user-updated", { detail: updated }));
  } catch {
    // ignore localStorage parse errors
  }
};

const dialogHeaderSx = {
  ...headerGradient,
  color: "#fff",
  borderBottom: `3px solid ${BRAND_GOLD}`,
};

const dialogPaperSx = {
  borderRadius: 3,
  overflow: "hidden",
  m: { xs: 1.5, sm: 2 },
  width: "100%",
  maxHeight: { xs: "calc(100% - 24px)", sm: "92vh" },
};

const dialogContentSx = {
  px: 2,
  width: "100%",
  boxSizing: "border-box",
};

const dialogActionsSx = {
  px: 2,
  py: 2,
  gap: 1,
  flexWrap: "wrap",
  bgcolor: "rgba(26,95,180,0.03)",
  borderTop: "1px solid rgba(26,95,180,0.08)",
  flexDirection: { xs: "column-reverse", sm: "row" },
  "& .MuiButton-root": {
    width: { xs: "100%", sm: "auto" },
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    py: { xs: 1.1, sm: 0.75 },
  },
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <Box
    sx={{
      p: { xs: 1.5, sm: 1.75 },
      borderRadius: 2.5,
      bgcolor: "rgba(26,95,180,0.04)",
      border: "1px solid rgba(26,95,180,0.1)",
      height: "100%",
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1.5,
          bgcolor: "rgba(26,95,180,0.1)",
          color: BRAND_BLUE,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box minWidth={0} flex={1}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={0.6}
          display="block"
        >
          {label}
        </Typography>
        <Typography fontWeight={600} color={BRAND_BLUE_DARK} sx={{ mt: 0.35, wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const FormSection = ({ title, hint, children }) => (
  <Box>
    <Typography variant="subtitle2" fontWeight={800} color={BRAND_BLUE_DARK} sx={{ mb: hint ? 0.25 : 1.25 }}>
      {title}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        {hint}
      </Typography>
    )}
    {children}
  </Box>
);

const RoleChip = ({ role }) => {
  const st = roleChipSx[role] || roleChipSx.engineer;
  return (
    <Chip
      label={formatStatus(role)}
      size="small"
      sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: st.bg, color: st.color }}
    />
  );
};

export default function Users() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const fileInputRef = useRef(null);

  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")?.id;
    } catch {
      return null;
    }
  })();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });

      const res = await fetch(`/api/admins?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setTotal(data.count || 0);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setFormMode("create");
    setForm(emptyForm);
    setShowPassword(false);
    setProfileFile(null);
    setProfilePreview("");
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setFormMode("edit");
    setSelected(user);
    setShowPassword(false);
    setProfileFile(null);
    setProfilePreview(user.profile_picture ? buildImageUrl(user.profile_picture) : "");
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "engineer",
      password: "",
      isActive: user.isActive !== false,
    });
    setFormOpen(true);
  };

  const openView = (user) => {
    setSelected(user);
    setViewOpen(true);
  };

  const handleDelete = async (user) => {
    if (user.id === currentUserId) {
      Swal.fire({ icon: "warning", title: "Not allowed", text: "You cannot delete your own account." });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete user?",
      text: `Remove ${user.name} (${user.email})? This cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: "#888",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admins/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
        if (viewOpen && selected?.id === user.id) setViewOpen(false);
        fetchUsers();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  const handleProfileFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Please choose an image file (JPG, PNG, GIF)." });
      return;
    }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Name and email are required." });
      return;
    }
    if (formMode === "create" && !form.password.trim()) {
      Swal.fire({ icon: "warning", title: "Password required", text: "Set a password for the new user." });
      return;
    }
    if (form.password.trim() && form.password.length < 8) {
      Swal.fire({ icon: "warning", title: "Weak password", text: "Password must be at least 8 characters." });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const isCreate = formMode === "create";

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("phone", form.phone.trim());
      formData.append("role", form.role);

      if (isCreate) {
        formData.append("password", form.password);
      } else {
        formData.append("isActive", String(form.isActive));
        if (form.password.trim()) {
          formData.append("password", form.password.trim());
        }
      }

      if (profileFile) {
        formData.append("profile_picture", profileFile);
      }

      const res = await fetch(isCreate ? "/api/admins" : `/api/admins/${selected.id}`, {
        method: isCreate ? "POST" : "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || `Failed to ${isCreate ? "create" : "update"} user`);
      }

      if (data.data) {
        syncLoggedInUser(data.data);
        if (viewOpen && selected?.id === data.data.id) {
          setSelected(data.data);
        }
      }

      setFormOpen(false);
      setForm(emptyForm);
      setShowPassword(false);
      setProfileFile(null);
      setProfilePreview("");
      fetchUsers();
      Swal.fire({
        icon: "success",
        title: isCreate ? "User created!" : "User updated!",
        text: isCreate
          ? `${form.name.trim()} can now sign in to the admin portal.`
          : `Changes for ${form.name.trim()} were saved successfully.`,
        confirmButtonColor: BRAND_BLUE,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: formMode === "create" ? "Could not create user" : "Could not update user",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: BRAND_BLUE,
      });
    } finally {
      setSaving(false);
    }
  };

  const renderRolePicker = () => {
    if (isMobile) {
      return (
        <FormControl fullWidth size="small" required sx={fieldSx}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
    <Grid container spacing={1.25}>
      {ROLE_OPTIONS.map(({ value, label, hint, Icon }) => {
        const selected = form.role === value;
        const st = roleChipSx[value] || roleChipSx.engineer;
        return (
          <Grid item xs={12} sm={4} key={value}>
            <Box
              component="button"
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              sx={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                p: { xs: 1.5, sm: 1.75 },
                borderRadius: 2.5,
                border: selected ? `2px solid ${BRAND_BLUE}` : "1px solid rgba(26,95,180,0.15)",
                bgcolor: selected ? "rgba(26,95,180,0.08)" : "#fff",
                boxShadow: selected ? "0 6px 18px rgba(26,95,180,0.12)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: BRAND_BLUE,
                  bgcolor: "rgba(26,95,180,0.05)",
                },
              }}
            >
              <Stack spacing={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: st.bg,
                    color: st.color,
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Typography fontWeight={800} fontSize="0.85rem" color={BRAND_BLUE_DARK}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
                  {hint}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        );
      })}
    </Grid>
    );
  };

  return (
    <Box sx={pageBackground}>
      <Box sx={{ ...headerGradient, p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <UsersIcon sx={{ color: BRAND_GOLD, fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#fff">
                Users
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                Manage admin portal accounts
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: BRAND_GOLD,
              color: BRAND_BLUE_DARK,
              border: "2px solid rgba(255,255,255,0.45)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#ffe066",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
              },
            }}
          >
            Add User
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(26,95,180,0.12)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: BRAND_BLUE }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table
                size="small"
                sx={{
                  width: "100%",
                  tableLayout: { xs: "auto", md: "fixed" },
                  minWidth: { xs: 0, sm: 520 },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(26,95,180,0.06)" }}>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, width: { xs: 36, sm: 48 }, minWidth: { xs: 36, sm: 48 }, px: { xs: 1, sm: 2 } }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, px: { xs: 1, sm: 2 }, minWidth: 0 }}>
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: BRAND_BLUE,
                        width: { xs: 112, sm: 132 },
                        minWidth: { xs: 112, sm: 132 },
                        px: { xs: 0.75, sm: 2 },
                        whiteSpace: "nowrap",
                        fontSize: { xs: "0.72rem", sm: "0.875rem" },
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <UsersIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.3, mb: 1 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                          No users yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, px: { xs: 1, sm: 2 } }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1, sm: 2 }, minWidth: 0 }}>
                          <Typography fontWeight={700} color={BRAND_BLUE_DARK} sx={{ wordBreak: "break-word" }}>
                            {user.name}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: { xs: 112, sm: 132 },
                            minWidth: { xs: 112, sm: 132 },
                            px: { xs: 0.25, sm: 2 },
                          }}
                        >
                          <Stack direction="row" spacing={0} justifyContent="center" flexWrap="nowrap">
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => openView(user)} sx={{ color: BRAND_BLUE, p: 0.75 }}>
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit user">
                              <IconButton size="small" onClick={() => openEdit(user)} sx={{ color: BRAND_BLUE_DARK, p: 0.75 }}>
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.id === currentUserId ? "Cannot delete yourself" : "Delete user"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(user)}
                                  disabled={user.id === currentUserId}
                                  sx={{ color: "#c62828", p: 0.75 }}
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* View dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{ sx: dialogPaperSx }}
      >
        {selected && (
          <>
            <Box sx={{ ...dialogHeaderSx, position: "relative", pt: 2, pb: { xs: 5.5, sm: 6 }, px: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: BRAND_GOLD, fontWeight: 800, letterSpacing: 1.4, lineHeight: 1.2 }}
                  >
                    Team member
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#fff" sx={{ mt: 0.25 }}>
                    Profile overview
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setViewOpen(false)}
                  size="small"
                  aria-label="Close"
                  sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Avatar
                key={selected.profile_picture || selected.id}
                src={selected.profile_picture ? buildImageUrl(selected.profile_picture) : undefined}
                alt={selected.name}
                imgProps={{ style: { objectFit: "cover" } }}
                sx={{
                  position: "absolute",
                  left: 16,
                  bottom: { xs: -36, sm: -40 },
                  width: { xs: 72, sm: 80 },
                  height: { xs: 72, sm: 80 },
                  fontSize: { xs: "1.5rem", sm: "1.75rem" },
                  fontWeight: 800,
                  bgcolor: BRAND_BLUE,
                  border: `3px solid ${BRAND_GOLD}`,
                  boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
                }}
              >
                {getInitials(selected.name)}
              </Avatar>
            </Box>

            <DialogContent sx={{ ...dialogContentSx, pt: { xs: 5.5, sm: 6 }, pb: 2 }}>
              <Stack spacing={2.5} sx={{ width: "100%" }}>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h5" fontWeight={800} color={BRAND_BLUE_DARK} sx={{ wordBreak: "break-word" }}>
                    {selected.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    <RoleChip role={selected.role} />
                    <Chip
                      icon={selected.isActive === false ? <InactiveIcon /> : <ActiveIcon />}
                      label={selected.isActive === false ? "Inactive" : "Active"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: selected.isActive === false ? "rgba(0,0,0,0.06)" : "rgba(46,125,50,0.12)",
                        color: selected.isActive === false ? "#666" : "#2e7d32",
                        "& .MuiChip-icon": { fontSize: 16 },
                      }}
                    />
                    {selected.id === currentUserId && (
                      <Chip label="You" size="small" sx={{ fontWeight: 700, bgcolor: "rgba(245,197,24,0.25)", color: "#9a7b00" }} />
                    )}
                  </Stack>
                </Box>

                <Stack spacing={1.5} sx={{ width: "100%" }}>
                  <InfoTile icon={EmailIcon} label="Email" value={selected.email} />
                  <InfoTile icon={PhoneIcon} label="Phone" value={selected.phone} />
                  <InfoTile icon={BadgeIcon} label="Role" value={formatStatus(selected.role)} />
                  <InfoTile
                    icon={ScheduleIcon}
                    label="Last login"
                    value={selected.lastLogin ? formatDate(selected.lastLogin) : "Never logged in"}
                  />
                </Stack>

                <Box
                  sx={{
                    width: "100%",
                    p: 1.75,
                    borderRadius: 2.5,
                    bgcolor: "rgba(245,197,24,0.08)",
                    border: "1px solid rgba(245,197,24,0.35)",
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Account created
                  </Typography>
                  <Typography fontWeight={600} color={BRAND_BLUE_DARK} sx={{ mt: 0.35 }}>
                    {formatDate(selected.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={dialogActionsSx}>
              {selected.id !== currentUserId && (
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setViewOpen(false);
                    handleDelete(selected);
                  }}
                  sx={{
                    color: "#c62828",
                    border: "1px solid rgba(198,40,40,0.35)",
                    bgcolor: "rgba(198,40,40,0.04)",
                    "&:hover": { bgcolor: "rgba(198,40,40,0.1)" },
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => {
                  setViewOpen(false);
                  openEdit(selected);
                }}
                sx={{ ...primaryButtonSx, ml: { sm: "auto" } }}
              >
                Edit profile
              </Button>
              <Button onClick={() => setViewOpen(false)} sx={{ color: BRAND_BLUE, display: { xs: "none", sm: "inline-flex" } }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <Box sx={{ ...dialogHeaderSx, px: 2, py: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: BRAND_GOLD, fontWeight: 800, letterSpacing: 1.4, lineHeight: 1.2 }}
              >
                {formMode === "create" ? "New account" : "Update account"}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#fff">
                {formMode === "create" ? "Add team member" : "Edit team member"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", display: "block", mt: 0.5 }}>
                {formMode === "create"
                  ? "Create a new SafeWire admin portal login"
                  : `Updating ${selected?.name || "user"} details`}
              </Typography>
            </Box>
            <IconButton
              onClick={() => !saving && setFormOpen(false)}
              disabled={saving}
              size="small"
              aria-label="Close"
              sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ ...dialogContentSx, py: 2.5 }}>
          <Stack spacing={3} sx={{ width: "100%" }}>
            <FormSection
              title="Profile photo"
              hint={formMode === "create" ? "Optional. Shown in the app bar when this user signs in." : "Update the photo shown in the app bar for this user."}
            >
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleProfileFile(e.dataTransfer.files?.[0]);
                }}
                sx={{
                  width: "100%",
                  border: `2px dashed rgba(26,95,180,0.35)`,
                  borderRadius: 2.5,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: "rgba(26,95,180,0.03)",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: BRAND_BLUE, bgcolor: "rgba(26,95,180,0.06)" },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleProfileFile(e.target.files?.[0])}
                />
                {profilePreview ? (
                  <Avatar
                    src={profilePreview}
                    alt="Profile preview"
                    imgProps={{ style: { objectFit: "cover" } }}
                    sx={{
                      width: 88,
                      height: 88,
                      mx: "auto",
                      mb: 1,
                      border: `3px solid ${BRAND_GOLD}`,
                      boxShadow: "0 8px 20px rgba(26,95,180,0.18)",
                    }}
                  />
                ) : (
                  <UploadIcon sx={{ fontSize: 42, color: BRAND_BLUE, opacity: 0.55, mb: 0.5 }} />
                )}
                <Typography fontWeight={700} color={BRAND_BLUE_DARK}>
                  {profilePreview ? "Tap to change photo" : "Upload profile photo"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  JPG, PNG, or GIF up to 10MB
                </Typography>
              </Box>
            </FormSection>

            <FormSection title="Profile" hint="Basic contact information for this user.">
              <Stack spacing={2} sx={{ width: "100%" }}>
                <TextField
                  label="Full name"
                  required
                  fullWidth
                  size="small"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  size="small"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Email address"
                  required
                  fullWidth
                  size="small"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </FormSection>

            <FormSection title="Role & access" hint="Choose what this person can do in the portal.">
              {renderRolePicker()}
            </FormSection>

            {formMode === "create" ? (
              <FormSection title="Security" hint="Set a strong password — minimum 8 characters.">
                <TextField
                  label="Password"
                  required
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  helperText="Minimum 8 characters"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{ color: BRAND_BLUE }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <ViewIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormSection>
            ) : (
              <>
              <FormSection title="Account status" hint="Inactive users cannot sign in to the admin portal.">
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2.5,
                    border: form.isActive ? "1px solid rgba(46,125,50,0.3)" : "1px solid rgba(0,0,0,0.12)",
                    bgcolor: form.isActive ? "rgba(46,125,50,0.06)" : "rgba(0,0,0,0.03)",
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: 1.5,
                          bgcolor: form.isActive ? "rgba(46,125,50,0.12)" : "rgba(0,0,0,0.08)",
                          color: form.isActive ? "#2e7d32" : "#666",
                          display: "flex",
                        }}
                      >
                        {form.isActive ? <ActiveIcon sx={{ fontSize: 20 }} /> : <InactiveIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Box minWidth={0}>
                        <Typography fontWeight={800} color={BRAND_BLUE_DARK}>
                          {form.isActive ? "Active account" : "Inactive account"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.isActive ? "User can log in and use the portal" : "Login is disabled for this user"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      sx={{
                        flexShrink: 0,
                        "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND_BLUE },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND_BLUE },
                      }}
                    />
                  </Stack>
                </Box>
              </FormSection>

              <FormSection
                title="Password"
                hint="For security, the current password cannot be shown. Leave blank to keep it, or enter a new password to change it."
              >
                <TextField
                  label="New password"
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  helperText="Minimum 8 characters when changing password"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 18, color: BRAND_BLUE, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{ color: BRAND_BLUE }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <ViewIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormSection>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button onClick={() => setFormOpen(false)} disabled={saving} sx={{ color: BRAND_BLUE }}>
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} variant="contained" disabled={saving} sx={primaryButtonSx}>
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : formMode === "create" ? (
              "Create user"
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
