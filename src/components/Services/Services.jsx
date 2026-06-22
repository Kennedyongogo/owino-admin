import React, { useState, useEffect, useRef } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ElectricalServices as ServiceIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  primaryButtonSx,
  fieldSx,
} from "../Projects/projectTheme";

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return imageUrl;
};

const ActiveChip = ({ active }) => (
  <Chip
    icon={active ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
    label={active ? "Active" : "Inactive"}
    size="small"
    sx={{
      fontWeight: 700,
      fontSize: "0.72rem",
      bgcolor: active ? "rgba(46, 125, 50, 0.12)" : "rgba(0,0,0,0.08)",
      color: active ? "#2e7d32" : "#666",
      border: active ? "1px solid rgba(46,125,50,0.25)" : "1px solid rgba(0,0,0,0.12)",
    }}
  />
);

const dialogHeaderSx = {
  background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
  color: "#fff",
  borderBottom: `3px solid ${BRAND_GOLD}`,
  px: 3,
  py: 2.5,
};

const ServiceFormDialog = ({ open, mode, service, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setImageFile(null);
    if (mode === "edit" && service) {
      setName(service.name || "");
      setDescription(service.description || "");
      setActive(service.active !== false);
      setImagePreview(service.image ? buildImageUrl(service.image) : "");
    } else {
      setName("");
      setDescription("");
      setActive(true);
      setImagePreview("");
    }
  }, [open, mode, service]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Please select an image file (JPG, PNG, GIF)." });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Swal.fire({ icon: "error", title: "Validation", text: "Service name is required." });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({ icon: "error", title: "Error", text: "Not authenticated. Please login again." });
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    formData.append("active", String(active));
    if (imageFile) formData.append("image", imageFile);

    try {
      setSaving(true);
      const url = mode === "edit" ? `/api/services/${service.id}` : "/api/services";
      const response = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        onClose();
        onSaved();
        Swal.fire({
          icon: "success",
          title: mode === "edit" ? "Service updated!" : "Service created!",
          text:
            mode === "edit"
              ? "Your changes have been saved successfully."
              : "The new service has been added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || `Failed to ${mode === "edit" ? "update" : "create"} service`,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || `Failed to ${mode === "edit" ? "update" : "create"} service`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
      <DialogTitle sx={{ ...dialogHeaderSx, m: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {mode === "edit" ? "Edit Service" : "New Service"}
            </Typography>
            <Typography variant="caption" sx={{ color: BRAND_GOLD, fontWeight: 600 }}>
              {mode === "edit" ? "Update service details" : "Add a service to SafeWire Electrical"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          sx={{
            border: `2px dashed rgba(26,95,180,0.35)`,
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            mb: 3,
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
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {imagePreview ? (
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 2, mb: 1 }}
            />
          ) : (
            <UploadIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.5, mb: 1 }} />
          )}
          <Typography fontWeight={700} color={BRAND_BLUE}>
            {imagePreview ? "Click to change image" : "Upload service image"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag & drop or click — JPG, PNG, GIF up to 10MB
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          <TextField
            label="Service name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={fieldSx}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            placeholder="Describe what this service includes..."
            sx={fieldSx}
          />
          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND_GOLD },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND_BLUE },
                }}
              />
            }
            label={
              <Box>
                <Typography fontWeight={700} fontSize="0.9rem">
                  {active ? "Active" : "Inactive"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {active ? "Visible on the public site" : "Hidden from customers"}
                </Typography>
              </Box>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ ...primaryButtonSx, minWidth: 120 }}
        >
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Service"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ServiceViewDialog = ({ open, service, onClose, onEdit }) => {
  if (!service) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
      <DialogTitle sx={{ ...dialogHeaderSx, m: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Service Details
            </Typography>
            <Typography variant="caption" sx={{ color: BRAND_GOLD, fontWeight: 600 }}>
              View full service information
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {service.image ? (
          <Box
            component="img"
            src={buildImageUrl(service.image)}
            alt={service.name}
            sx={{ width: "100%", maxHeight: 220, objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(26,95,180,0.08)",
            }}
          >
            <ServiceIcon sx={{ fontSize: 64, color: BRAND_BLUE, opacity: 0.35 }} />
          </Box>
        )}
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={2}>
            <Typography variant="h5" fontWeight={800} color="#1a1a2e">
              {service.name}
            </Typography>
            <ActiveChip active={service.active} />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="overline" sx={{ color: BRAND_BLUE, fontWeight: 700, letterSpacing: "0.08em" }}>
            Description
          </Typography>
          <Typography sx={{ mt: 1, lineHeight: 1.75, color: "#333", whiteSpace: "pre-wrap" }}>
            {service.description || "No description provided."}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            onClose();
            onEdit(service);
          }}
          sx={primaryButtonSx}
        >
          Edit Service
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Services = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedService, setSelectedService] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [page, rowsPerPage]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });

      const response = await fetch(`/api/services?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data || []);
        setTotal(data.count || 0);
      } else {
        setError(data.message || "Failed to fetch services");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: "Delete service?",
      text: `"${service.name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: BRAND_BLUE,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
        fetchServices();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  const openCreate = () => {
    setSelectedService(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (service) => {
    setSelectedService(service);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openView = (service) => {
    setSelectedService(service);
    setViewOpen(true);
  };

  const renderActions = (service) => (
    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => openView(service)}
          sx={{ color: BRAND_BLUE, p: { xs: 0.5, sm: 1 } }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => openEdit(service)}
          sx={{ color: BRAND_GOLD, bgcolor: "rgba(245,197,24,0.15)", p: { xs: 0.5, sm: 1 } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => handleDelete(service)}
          sx={{ color: "#c62828", p: { xs: 0.5, sm: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const colSpan = isSmallScreen ? 3 : 4;

  const paginationSx = {
    borderTop: `1px solid rgba(26,95,180,0.1)`,
    width: "100%",
    "& .MuiTablePagination-toolbar": {
      justifyContent: "flex-end",
      alignItems: "center",
      minHeight: 52,
      px: { xs: 1, sm: 2 },
      gap: { xs: 0.5, sm: 1 },
    },
    "& .MuiTablePagination-spacer": { flex: "1 1 auto" },
    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
      fontWeight: 600,
      fontSize: { xs: "0.75rem", sm: "0.875rem" },
      margin: 0,
    },
    "& .MuiTablePagination-select": {
      fontSize: { xs: "0.75rem", sm: "0.875rem" },
      marginRight: { xs: 1, sm: 2 },
      marginLeft: { xs: 0.5, sm: 1 },
    },
    "& .MuiTablePagination-actions": { marginLeft: { xs: 0.5, sm: 1 } },
  };

  if (error && !loading && services.length === 0) {
    return (
      <Box sx={{ ...pageBackground, p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageBackground, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Paper elevation={0} sx={{ minHeight: "100vh", borderRadius: 0, width: "100%", maxWidth: "100%" }}>
        <Box sx={{ ...headerGradient, px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3.5 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" } }}>
                Services
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: "0.85rem", md: "1rem" } }}>
                Manage electrical services offered by SafeWire
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{ ...primaryButtonSx, width: { xs: "100%", sm: "auto" } }}
            >
              New Service
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 1, sm: 1.5, md: 4 }, py: { xs: 2, md: 3 }, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid rgba(26,95,180,0.12)`,
              boxShadow: "0 8px 32px rgba(26,95,180,0.08)",
              width: "100%",
              maxWidth: "100%",
              overflowX: "hidden",
            }}
          >
            <Table
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& th, & td": {
                  px: { xs: 0.75, sm: 1.5, md: 2 },
                  py: { xs: 1, sm: 1.5 },
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
                    "& th": {
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      border: 0,
                      py: { xs: 1.25, sm: 1.75 },
                    },
                  }}
                >
                  <TableCell sx={{ width: { xs: "12%", sm: 56 } }}>No</TableCell>
                  <TableCell sx={{ width: { xs: "53%", sm: "auto" } }}>Service</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, width: 120 }}>Status</TableCell>
                  <TableCell align="right" sx={{ width: { xs: "35%", sm: 130 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: BRAND_BLUE, display: "block", mx: "auto" }} />
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} sx={{ py: 6, border: 0 }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <ServiceIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.4, mb: 1 }} />
                        <Typography fontWeight={600} color="text.secondary">
                          No services found
                        </Typography>
                        <Button sx={{ mt: 2, ...primaryButtonSx }} startIcon={<AddIcon />} onClick={openCreate}>
                          Create Service
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service, idx) => (
                    <TableRow
                      key={service.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        borderLeft: "3px solid transparent",
                        "&:hover": {
                          bgcolor: "rgba(26,95,180,0.04)",
                          borderLeftColor: BRAND_GOLD,
                        },
                      }}
                      onClick={() => openView(service)}
                    >
                      <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell sx={{ overflow: "hidden" }}>
                        <Typography
                          fontWeight={700}
                          fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          color="#1a1a2e"
                          sx={{ wordBreak: "break-word", lineHeight: 1.35 }}
                        >
                          {service.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <ActiveChip active={service.active} />
                      </TableCell>
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ whiteSpace: "nowrap", p: { xs: 0.5, sm: 1.5 } }}
                      >
                        {renderActions(service)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
              rowsPerPageOptions={[5, 10, 25, 50]}
              showFirstButton={false}
              showLastButton={false}
              sx={paginationSx}
            />
          </TableContainer>
        </Box>
      </Paper>

      <ServiceFormDialog
        open={formOpen}
        mode={formMode}
        service={selectedService}
        onClose={() => setFormOpen(false)}
        onSaved={fetchServices}
      />
      <ServiceViewDialog
        open={viewOpen}
        service={selectedService}
        onClose={() => setViewOpen(false)}
        onEdit={openEdit}
      />
    </Box>
  );
};

export default Services;
