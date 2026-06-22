import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  LinearProgress,
  Chip,
  Slider,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  InfoOutlined,
  EventNote,
  AttachMoney,
  Engineering,
  Category as CategoryIcon,
  Bolt,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  cardSx,
  sectionTitleSx,
  fieldSx,
  primaryButtonSx,
  statusColors,
  formatStatus,
} from "./projectTheme";

const STATUS_OPTIONS = [
  "planning",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
];

const CURRENCY_OPTIONS = [
  { value: "KES", label: "Kenyan Shilling (KES)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

const CATEGORY_SUGGESTIONS = [
  "Commercial Wiring",
  "Residential Wiring",
  "Solar & Renewable",
  "Panel & DB Installation",
  "Industrial Power",
  "Maintenance & Repairs",
];

const REQUIRED_FIELDS = [
  { key: "name", label: "Project name" },
  { key: "location_name", label: "Location" },
  { key: "start_date", label: "Start date" },
  { key: "engineer_in_charge", label: "Engineer in charge" },
];

const INITIAL_FORM = {
  name: "",
  description: "",
  location_name: "",
  status: "planning",
  start_date: "",
  end_date: "",
  budget_estimate: "",
  actual_cost: "",
  currency: "KES",
  client_name: "",
  engineer_in_charge: "",
  progress_percent: 0,
  category: "",
};

const SectionCard = ({ step, icon: Icon, title, hint, children }) => (
  <Card
    sx={{
      ...cardSx,
      mb: { xs: 2, sm: 2.5 },
      transition: "box-shadow 0.25s ease, transform 0.25s ease",
      "&:hover": { boxShadow: "0 12px 40px rgba(26, 95, 180, 0.14)" },
    }}
  >
    <Box
      sx={{
        height: 4,
        background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD})`,
      }}
    />
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: 2,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${BRAND_BLUE}15, ${BRAND_GOLD}35)`,
            border: `2px solid ${BRAND_GOLD}66`,
            position: "relative",
          }}
        >
          <Icon sx={{ color: BRAND_BLUE, fontSize: { xs: 22, sm: 24 } }} />
          <Box
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: BRAND_BLUE,
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${BRAND_GOLD}`,
            }}
          >
            {step}
          </Box>
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography variant="h6" sx={{ ...sectionTitleSx, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </CardContent>
  </Card>
);

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admins", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success) setEngineers(result.data);
      } catch (err) {
        console.error("Error fetching engineers:", err);
      } finally {
        setLoadingEngineers(false);
      }
    };
    fetchEngineers();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const completion = useMemo(() => {
    const checks = [
      form.name.trim(),
      form.location_name.trim(),
      form.start_date,
      form.engineer_in_charge,
      form.description.trim(),
      form.end_date,
      form.budget_estimate !== "",
      form.client_name.trim(),
      form.category.trim(),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  const missingRequired = useMemo(
    () => REQUIRED_FIELDS.filter(({ key }) => !form[key]?.toString().trim()),
    [form]
  );

  const isFormValid = () => missingRequired.length === 0;

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      location_name: form.location_name.trim(),
      status: form.status,
      start_date: form.start_date,
      currency: form.currency,
      engineer_in_charge: form.engineer_in_charge,
      progress_percent: Number(form.progress_percent) || 0,
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.end_date) payload.end_date = form.end_date;
    if (form.budget_estimate !== "") payload.budget_estimate = Number(form.budget_estimate);
    if (form.actual_cost !== "") payload.actual_cost = Number(form.actual_cost);
    if (form.client_name.trim()) payload.client_name = form.client_name.trim();
    if (form.category.trim()) payload.category = form.category.trim();
    return payload;
  };

  const handleCreate = async () => {
    if (!isFormValid()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });
      const result = await response.json();
      if (result.success) {
        await Swal.fire({
          title: "Project Created!",
          text: `"${form.name.trim()}" is ready on SafeWire Electrical.`,
          icon: "success",
          confirmButtonColor: BRAND_BLUE,
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      await Swal.fire({
        title: "Could not create project",
        text: error.message || "Please check your entries and try again.",
        icon: "error",
        confirmButtonColor: BRAND_BLUE,
      });
    } finally {
      setSaving(false);
    }
  };

  const actionButtons = (
    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} width="100%">
      <Button
        variant="outlined"
        size="large"
        fullWidth
        onClick={() => navigate("/projects")}
        disabled={saving}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          borderColor: BRAND_BLUE,
          color: BRAND_BLUE,
          py: 1.35,
          flex: { sm: 1 },
          "&:hover": { borderColor: BRAND_BLUE_DARK, bgcolor: "rgba(26,95,180,0.06)" },
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
        onClick={handleCreate}
        disabled={!isFormValid() || saving}
        sx={{
          ...primaryButtonSx,
          color: "white",
          py: 1.35,
          flex: { sm: 2 },
          "&:disabled": { background: "#e0e0e0", color: "#999", boxShadow: "none" },
        }}
      >
        {saving ? "Creating..." : "Create Project"}
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ ...pageBackground, pb: { xs: 12, sm: 4 } }}>
      {/* Sticky top bar — mobile */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "sticky",
          top: 0,
          zIndex: 1100,
          ...headerGradient,
          px: 1.5,
          py: 1.25,
          boxShadow: "0 4px 20px rgba(26,95,180,0.25)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate("/projects")} sx={{ color: "white", p: 0.75 }}>
            <ArrowBack />
          </IconButton>
          <Box flex={1} minWidth={0}>
            <Typography fontWeight={800} fontSize="1rem" noWrap>
              New Project
            </Typography>
            <Typography variant="caption" sx={{ color: BRAND_GOLD }}>
              {completion}% complete
            </Typography>
          </Box>
          <Chip
            label={`${completion}%`}
            size="small"
            sx={{ bgcolor: "rgba(245,197,24,0.25)", color: BRAND_GOLD, fontWeight: 700 }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completion}
          sx={{
            mt: 1,
            height: 4,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 2,
              background: `linear-gradient(90deg, ${BRAND_GOLD}, #fff)`,
            },
          }}
        />
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 2, md: 4 } }}>
        {/* Desktop header */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            ...headerGradient,
            p: 3,
            borderRadius: 3,
            mb: 3,
            boxShadow: "0 12px 40px rgba(26,95,180,0.22)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(245,197,24,0.12)",
            }}
          />
          <Stack direction="row" alignItems="center" spacing={2} position="relative" zIndex={1}>
            <IconButton
              onClick={() => navigate("/projects")}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box
              component="img"
              src="/logo.png"
              alt="SafeWire"
              sx={{ height: 48, width: "auto", display: { xs: "none", lg: "block" } }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <Box flex={1}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Bolt sx={{ color: BRAND_GOLD }} />
                <Typography variant="h4" fontWeight={800}>
                  Create New Project
                </Typography>
              </Stack>
              <Typography sx={{ color: BRAND_GOLD, mt: 0.5, opacity: 0.95 }}>
                SafeWire Electrical — certified power, wiring & solar
              </Typography>
            </Box>
            <Box textAlign="right" minWidth={120}>
              <Typography variant="h5" fontWeight={800} color={BRAND_GOLD}>
                {completion}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                form complete
              </Typography>
            </Box>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completion}
            sx={{
              mt: 2.5,
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${BRAND_GOLD}, #fff8dc)`,
              },
            }}
          />
        </Box>

        {missingRequired.length > 0 && (
          <Alert
            severity="info"
            icon={<InfoOutlined />}
            sx={{
              mb: 2,
              borderRadius: 2,
              border: `1px solid rgba(26,95,180,0.2)`,
              "& .MuiAlert-icon": { color: BRAND_BLUE },
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Required to create:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {missingRequired.map(({ label }) => (
                <Chip key={label} label={label} size="small" variant="outlined" sx={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }} />
              ))}
            </Stack>
          </Alert>
        )}

        <SectionCard step={1} icon={InfoOutlined} title="Basic Info" hint="Name and site location for this job">
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              required
              label="Project Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Office Tower Electrical Fit-Out"
              helperText="A clear name helps your team find this project quickly"
              sx={fieldSx}
            />
            <TextField
              fullWidth
              required
              label="Location"
              value={form.location_name}
              onChange={(e) => handleChange("location_name", e.target.value)}
              placeholder="e.g. Westlands, Nairobi"
              helperText="Area, estate, or full site address"
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              minRows={3}
              maxRows={8}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Scope of work: wiring, panels, solar, maintenance..."
              sx={fieldSx}
            />
          </Stack>
        </SectionCard>

        <SectionCard step={2} icon={EventNote} title="Schedule & Status" hint="Timeline and current project stage">
          <Stack spacing={2.5}>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: statusColors[status]?.color || BRAND_BLUE,
                        }}
                      />
                      <span>{formatStatus(status)}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Progress — {form.progress_percent}%
              </Typography>
              <Slider
                value={Number(form.progress_percent) || 0}
                onChange={(_, v) => handleChange("progress_percent", v)}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{
                  color: BRAND_BLUE,
                  "& .MuiSlider-thumb": { border: `2px solid ${BRAND_GOLD}` },
                  "& .MuiSlider-track": { background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD})` },
                }}
              />
            </Box>
            <TextField
              fullWidth
              required
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.start_date || undefined }}
              helperText={form.start_date ? "Must be on or after start date" : "Optional — set when start date is chosen"}
              sx={fieldSx}
            />
          </Stack>
        </SectionCard>

        <SectionCard step={3} icon={AttachMoney} title="Financial" hint="Budget tracking in your chosen currency">
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Budget Estimate"
              type="number"
              value={form.budget_estimate}
              onChange={(e) => handleChange("budget_estimate", e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
              placeholder="0.00"
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Actual Cost"
              type="number"
              value={form.actual_cost}
              onChange={(e) => handleChange("actual_cost", e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
              placeholder="0.00"
              helperText="Leave at 0 for new projects"
              sx={fieldSx}
            />
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={form.currency}
                label="Currency"
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </SectionCard>

        <SectionCard step={4} icon={Engineering} title="Client & Engineer" hint="Who owns the job and who leads on site">
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Client Name"
              value={form.client_name}
              onChange={(e) => handleChange("client_name", e.target.value)}
              placeholder="Company or homeowner name"
              sx={fieldSx}
            />
            <FormControl fullWidth required sx={fieldSx} error={!form.engineer_in_charge && !loadingEngineers}>
              <InputLabel>Engineer in Charge</InputLabel>
              <Select
                value={form.engineer_in_charge}
                label="Engineer in Charge"
                onChange={(e) => handleChange("engineer_in_charge", e.target.value)}
                disabled={loadingEngineers}
              >
                <MenuItem value="">
                  <em>{loadingEngineers ? "Loading engineers..." : "Select engineer"}</em>
                </MenuItem>
                {engineers.map((eng) => (
                  <MenuItem key={eng.id} value={eng.id}>
                    {eng.name} — {formatStatus(eng.role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </SectionCard>

        <SectionCard step={5} icon={CategoryIcon} title="Category" hint="Type of electrical work">
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g. Commercial Wiring, Solar & Renewable"
              sx={fieldSx}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Quick picks:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    onClick={() => handleChange("category", cat)}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 600,
                      bgcolor: form.category === cat ? "rgba(245,197,24,0.25)" : "rgba(26,95,180,0.08)",
                      color: form.category === cat ? "#9a7b00" : BRAND_BLUE,
                      border: form.category === cat ? `1px solid ${BRAND_GOLD}` : "none",
                      "&:hover": { bgcolor: "rgba(245,197,24,0.2)" },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </SectionCard>

        {/* Desktop actions */}
        <Card sx={{ ...cardSx, display: { xs: "none", sm: "block" } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Divider sx={{ mb: 2, borderColor: "rgba(26,95,180,0.1)" }} />
            {actionButtons}
          </CardContent>
        </Card>
      </Container>

      {/* Sticky bottom bar — mobile */}
      <Paper
        elevation={8}
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          p: 1.5,
          borderTop: `3px solid ${BRAND_GOLD}`,
          bgcolor: "white",
        }}
      >
        {actionButtons}
      </Paper>
    </Box>
  );
};

export default ProjectCreate;
