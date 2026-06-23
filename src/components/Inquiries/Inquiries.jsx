import React, { useState, useEffect } from "react";
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
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  ContactMail as InquiryIcon,
  Phone as PhoneIcon,
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
} from "../Projects/projectTheme";

const statusChipSx = {
  open: { bg: "rgba(211,47,47,0.12)", color: "#c62828" },
  in_review: { bg: "rgba(245,197,24,0.2)", color: "#9a7b00" },
  resolved: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
};

const CATEGORY_LABELS = {
  general_inquiry: "General Inquiry",
  quote_request: "Quote Request",
  residential_wiring: "Residential Wiring",
  commercial_electrical: "Commercial Electrical",
  solar_installation: "Solar Installation",
  emergency_repair: "Emergency Repair",
  lighting_installation: "Lighting Installation",
  safety_inspection: "Safety Inspection",
  project_inquiry: "Project Inquiry",
  other: "Other",
};

const formatStatus = (s) =>
  (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getCategoryLabel = (c) => CATEGORY_LABELS[c] || c;

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

const emptyForm = {
  name: "",
  phone_number: "",
  description: "",
  category: "",
  project_id: "",
  status: "open",
};

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchInquiries = async () => {
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
      const res = await fetch(`/api/issues?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data || []);
        setTotal(data.count || 0);
      } else {
        setError(data.message || "Failed to load inquiries");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/projects?limit=500", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProjects(data.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const openView = (inquiry) => {
    setSelected(inquiry);
    setViewOpen(true);
  };

  const openEdit = (inquiry) => {
    setSelected(inquiry);
    setEditForm({
      name: inquiry.name || "",
      phone_number: inquiry.phone_number || "",
      description: inquiry.description || "",
      category: inquiry.category || "",
      project_id: inquiry.project_id || "",
      status: inquiry.status || "open",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!selected?.id) return;
    if (!editForm.name?.trim() || !editForm.phone_number?.trim() || !editForm.description?.trim()) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Name, phone, and message are required." });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/issues/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          project_id: editForm.project_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update inquiry");
      }
      setEditOpen(false);
      setSelected(null);
      fetchInquiries();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Inquiry updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={pageBackground}>
      <Box sx={{ ...headerGradient, p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <InquiryIcon sx={{ color: BRAND_GOLD, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff">
              Inquiries
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
              Contact form messages from the SafeWire public website
            </Typography>
          </Box>
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(26,95,180,0.06)" }}>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, width: 56 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE }}>Inquiry</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, width: 120 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <InquiryIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.3, mb: 1 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                          No inquiries yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inquiries.map((inquiry, index) => {
                      const st = statusChipSx[inquiry.status] || statusChipSx.open;
                      return (
                        <TableRow key={inquiry.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                              <Typography fontWeight={700} color={BRAND_BLUE_DARK}>
                                {inquiry.name}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.25}>
                                <PhoneIcon sx={{ fontSize: 14, color: BRAND_BLUE }} />
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                  {inquiry.phone_number}
                                </Typography>
                              </Stack>
                              <Chip
                                label={getCategoryLabel(inquiry.category)}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.68rem",
                                  bgcolor: "rgba(26,95,180,0.08)",
                                  color: BRAND_BLUE,
                                }}
                              />
                              <Chip
                                label={formatStatus(inquiry.status)}
                                size="small"
                                sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: st.bg, color: st.color }}
                              />
                            </Stack>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.5,
                              }}
                            >
                              {inquiry.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View details">
                                <IconButton size="small" onClick={() => openView(inquiry)} sx={{ color: BRAND_BLUE }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit inquiry">
                                <IconButton size="small" onClick={() => openEdit(inquiry)} sx={{ color: BRAND_GOLD }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ ...headerGradient, color: "#fff", borderBottom: `3px solid ${BRAND_GOLD}` }}>
          <Typography fontWeight={800}>Inquiry Details</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Name
                </Typography>
                <Typography fontWeight={700} color={BRAND_BLUE_DARK}>{selected.name}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Phone
                </Typography>
                <Typography fontWeight={600}>{selected.phone_number}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Category
                </Typography>
                <Chip
                  label={getCategoryLabel(selected.category)}
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600, bgcolor: "rgba(26,95,180,0.1)", color: BRAND_BLUE }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Status
                </Typography>
                <Chip
                  label={formatStatus(selected.status)}
                  size="small"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    bgcolor: (statusChipSx[selected.status] || statusChipSx.open).bg,
                    color: (statusChipSx[selected.status] || statusChipSx.open).color,
                  }}
                />
              </Box>
              {selected.project?.name && (
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                    Related Project
                  </Typography>
                  <Typography fontWeight={600}>{selected.project.name}</Typography>
                </Box>
              )}
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Message
                </Typography>
                <Typography sx={{ mt: 0.75, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selected.description}
                </Typography>
              </Box>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Received {formatDate(selected.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              setViewOpen(false);
              openEdit(selected);
            }}
            sx={{ textTransform: "none", fontWeight: 600, color: BRAND_BLUE }}
          >
            Edit
          </Button>
          <Button onClick={() => setViewOpen(false)} sx={{ ml: "auto", textTransform: "none", color: BRAND_BLUE }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ ...headerGradient, color: "#fff", borderBottom: `3px solid ${BRAND_GOLD}` }}>
          <Typography fontWeight={800}>Edit Inquiry</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Name"
              required
              fullWidth
              size="small"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={fieldSx}
            />
            <TextField
              label="Phone number"
              required
              fullWidth
              size="small"
              value={editForm.phone_number}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              sx={fieldSx}
            />
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_review">In Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Related project</InputLabel>
              <Select
                label="Related project"
                value={editForm.project_id || ""}
                onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Message"
              required
              fullWidth
              multiline
              minRows={4}
              size="small"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={saving} sx={{ textTransform: "none", color: BRAND_BLUE }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ ...primaryButtonSx, textTransform: "none" }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
