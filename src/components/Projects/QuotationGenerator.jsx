import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  BRAND_BLUE,
  BRAND_BLUE_DARK,
  BRAND_GOLD,
  cardSx,
  fieldSx,
  headerGradient,
} from "./projectTheme";

const parseCost = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : Math.max(0, num);
};

const QuotationGenerator = ({ projectId, projectName, onClose, open }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [projectCost, setProjectCost] = useState("");
  const [taskCosts, setTaskCosts] = useState({});
  const [notes, setNotes] = useState("");

  const currency = invoiceData?.project?.currency || "KES";

  const formatCurrency = useCallback(
    (amount) => {
      try {
        return new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency,
        }).format(amount);
      } catch {
        return `${currency} ${Number(amount).toFixed(2)}`;
      }
    },
    [currency]
  );

  const fetchInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(`/api/quotations/project/${projectId}/invoice-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load invoice data");
      }

      const result = await response.json();
      setInvoiceData(result.data);

      const tasks = result.data?.tasks || [];
      const estimate = result.data?.project?.budget_estimate;
      setProjectCost(estimate != null && estimate !== "" ? String(estimate) : "");

      const costs = {};
      tasks.forEach((task) => {
        costs[task.id] = "";
      });
      setTaskCosts(costs);
      setNotes("");
    } catch (err) {
      console.error("Error fetching invoice data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open && projectId) {
      fetchInvoiceData();
    }
  }, [open, projectId, fetchInvoiceData]);

  const breakdownTotal = useMemo(() => {
    if (!invoiceData?.tasks) return 0;
    return invoiceData.tasks.reduce((sum, task) => sum + parseCost(taskCosts[task.id]), 0);
  }, [invoiceData, taskCosts]);

  const totalProjectCost = useMemo(() => parseCost(projectCost), [projectCost]);

  const breakdownMismatch =
    totalProjectCost > 0 && breakdownTotal > 0 && Math.abs(breakdownTotal - totalProjectCost) > 0.009;

  const handleTaskCostChange = (taskId, value) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setTaskCosts((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleProjectCostChange = (value) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setProjectCost(value);
  };

  const generatePDF = async () => {
    try {
      setGenerating(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const tasks = (invoiceData?.tasks || []).map((task) => ({
        id: task.id,
        name: task.name,
        cost: parseCost(taskCosts[task.id]),
      }));

      const response = await fetch(`/api/quotations/project/${projectId}/invoice-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectCost: totalProjectCost,
          tasks,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate invoice PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${projectName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating invoice PDF:", err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setInvoiceData(null);
    setError(null);
    onClose();
  };

  const canGenerate = totalProjectCost > 0 && !loading && !generating;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ ...headerGradient, px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <PdfIcon sx={{ color: BRAND_GOLD }} />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Generate Invoice
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {projectName}
              </Typography>
            </Box>
          </Box>
          <Button onClick={handleClose} size="small" sx={{ color: "#fff", minWidth: 0 }}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: BRAND_BLUE }} />
          </Box>
        ) : invoiceData ? (
          <Stack spacing={2.5}>
            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color={BRAND_BLUE} gutterBottom>
                  {invoiceData.company?.name || "SafeWire Electricals"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Invoice for <strong>{invoiceData.project.name}</strong>
                  {invoiceData.project.client_name ? ` · ${invoiceData.project.client_name}` : ""}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2">{invoiceData.project.location_name || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body2">{currency}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color={BRAND_BLUE} gutterBottom>
                  Total project cost
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Total project cost"
                  value={projectCost}
                  onChange={(e) => handleProjectCostChange(e.target.value)}
                  placeholder="0.00"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                  }}
                  helperText="This is the invoice total. Task costs below break down what the project includes."
                />
              </CardContent>
            </Card>

            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color={BRAND_BLUE} gutterBottom>
                  Task breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Allocate portions of the total across tasks to show what the project entails.
                </Typography>
                {invoiceData.tasks?.length ? (
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {invoiceData.tasks.map((task) => (
                      <Box key={task.id}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          {task.name}
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          label="Breakdown amount"
                          value={taskCosts[task.id] ?? ""}
                          onChange={(e) => handleTaskCostChange(task.id, e.target.value)}
                          placeholder="0.00"
                          sx={fieldSx}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tasks on this project yet. The invoice will show the total project cost only.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {breakdownMismatch && (
              <Alert severity="warning">
                Breakdown subtotal ({formatCurrency(breakdownTotal)}) does not match the total project cost (
                {formatCurrency(totalProjectCost)}). You can still download, but consider aligning the amounts.
              </Alert>
            )}

            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color={BRAND_BLUE} gutterBottom>
                  Notes (optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, scope notes, etc."
                  sx={fieldSx}
                />
              </CardContent>
            </Card>

            <Card
              sx={{
                ...cardSx,
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
                color: "#fff",
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  {breakdownTotal > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Breakdown subtotal</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(breakdownTotal)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.25)" }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={800}>
                      Total project cost
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: BRAND_GOLD }}>
                      {formatCurrency(totalProjectCost)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={handleClose} disabled={generating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
          onClick={generatePDF}
          disabled={!canGenerate}
          sx={{
            bgcolor: BRAND_BLUE,
            "&:hover": { bgcolor: BRAND_BLUE_DARK },
          }}
        >
          {generating ? "Generating…" : "Download PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuotationGenerator;
