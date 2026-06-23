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
  Rating,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  primaryButtonSx,
} from "../Projects/projectTheme";

const statusChipSx = {
  pending: { bg: "rgba(245,197,24,0.2)", color: "#9a7b00" },
  approved: { bg: "rgba(46,125,50,0.12)", color: "#2e7d32" },
  rejected: { bg: "rgba(211,47,47,0.12)", color: "#c62828" },
};

const formatStatus = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchReviews = async () => {
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
      const res = await fetch(`/api/reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
        setTotal(data.count || 0);
      } else {
        setError(data.message || "Failed to load reviews");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, rowsPerPage]);

  const updateStatus = async (review, status) => {
    const action = status === "approved" ? "approve" : "reject";
    const result = await Swal.fire({
      icon: "question",
      title: `${formatStatus(status)} review?`,
      text: `Review from ${review.name}`,
      showCancelButton: true,
      confirmButtonColor: BRAND_BLUE,
      cancelButtonColor: "#888",
      confirmButtonText: `Yes, ${action}`,
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reviews/${review.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Review ${status}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchReviews();
        if (viewOpen && selected?.id === review.id) {
          setSelected({ ...review, status });
        }
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  const openView = (review) => {
    setSelected(review);
    setViewOpen(true);
  };

  return (
    <Box sx={pageBackground}>
      <Box sx={{ ...headerGradient, p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ReviewIcon sx={{ color: BRAND_GOLD, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff">
              Reviews
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
              Approve or reject customer ratings for the public site
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
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE }}>Review</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, width: 200 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <ReviewIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.3, mb: 1 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                          No reviews yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review, index) => {
                      const st = statusChipSx[review.status] || statusChipSx.pending;
                      return (
                        <TableRow key={review.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                              <Typography fontWeight={700} color={BRAND_BLUE_DARK}>
                                {review.name}
                              </Typography>
                              <Rating value={review.rating} readOnly size="small" />
                              <Chip
                                label={formatStatus(review.status)}
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
                              {review.comment}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View details">
                                <IconButton size="small" onClick={() => openView(review)} sx={{ color: BRAND_BLUE }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {review.status !== "approved" && (
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => updateStatus(review, "approved")}
                                    sx={{ color: "#2e7d32" }}
                                  >
                                    <ApproveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {review.status !== "rejected" && (
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => updateStatus(review, "rejected")}
                                    sx={{ color: "#c62828" }}
                                  >
                                    <RejectIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
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

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ ...headerGradient, color: "#fff", borderBottom: `3px solid ${BRAND_GOLD}` }}>
          <Typography fontWeight={800}>Review Details</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Name
                </Typography>
                <Typography fontWeight={700} color={BRAND_BLUE_DARK}>
                  {selected.name}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Rating
                </Typography>
                <Rating value={selected.rating} readOnly sx={{ mt: 0.5 }} />
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
                    ...(statusChipSx[selected.status] || statusChipSx.pending),
                    bgcolor: (statusChipSx[selected.status] || statusChipSx.pending).bg,
                    color: (statusChipSx[selected.status] || statusChipSx.pending).color,
                  }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                  Comment
                </Typography>
                <Typography sx={{ mt: 0.75, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selected.comment}
                </Typography>
              </Box>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Submitted {formatDate(selected.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {selected?.status !== "approved" && (
            <Button
              startIcon={<ApproveIcon />}
              onClick={() => updateStatus(selected, "approved")}
              sx={{ color: "#2e7d32", textTransform: "none", fontWeight: 600 }}
            >
              Approve
            </Button>
          )}
          {selected?.status !== "rejected" && (
            <Button
              startIcon={<RejectIcon />}
              onClick={() => updateStatus(selected, "rejected")}
              sx={{ color: "#c62828", textTransform: "none", fontWeight: 600 }}
            >
              Reject
            </Button>
          )}
          <Button onClick={() => setViewOpen(false)} sx={{ ml: "auto", textTransform: "none", color: BRAND_BLUE }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
