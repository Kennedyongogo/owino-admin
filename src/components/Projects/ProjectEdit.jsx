import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Construction,
  AttachMoney,
  Person,
  Image as ImageIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  pageBackground,
  headerGradient,
  cardSx,
  sectionTitleSx,
  fieldSx,
  primaryButtonSx,
  statusColors,
  formatStatus,
  buildImageUrl,
  percentFieldSx,
  formatProgressInput,
  parseProgressPercent,
  sanitizeProgressInput,
} from "./projectTheme";
import ProjectImageUpload from "./ProjectImageUpload";

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

const EMPTY_FORM = {
  name: "",
  location_name: "",
  description: "",
  status: "planning",
  start_date: "",
  end_date: "",
  budget_estimate: "",
  actual_cost: "",
  currency: "KES",
  client_name: "",
  progress_percent: "",
  category: "",
};

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        setProject(data);
        setImageFile(null);
        setImagePreview(data.image ? buildImageUrl(data.image) : "");
        setForm({
          name: data.name || "",
          location_name: data.location_name || "",
          description: data.description || "",
          status: data.status || "planning",
          start_date: data.start_date ? data.start_date.split("T")[0] : "",
          end_date: data.end_date ? data.end_date.split("T")[0] : "",
          budget_estimate: data.budget_estimate ?? "",
          actual_cost: data.actual_cost ?? "",
          currency: data.currency || "KES",
          client_name: data.client_name || "",
          progress_percent: formatProgressInput(data.progress_percent),
          category: data.category || "",
        });
      } else {
        setError(result.message || "Failed to fetch project details");
      }
    } catch (err) {
      setError("Failed to fetch project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    description: form.description,
    status: form.status,
    start_date: form.start_date,
    end_date: form.end_date || null,
    budget_estimate: form.budget_estimate !== "" ? form.budget_estimate : null,
    actual_cost: form.actual_cost !== "" ? form.actual_cost : null,
    currency: form.currency,
    client_name: form.client_name,
    progress_percent: parseProgressPercent(form.progress_percent, project?.progress_percent ?? 0),
    category: form.category,
  });

  const buildFormData = () => {
    const formData = new FormData();
    const payload = buildPayload();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    if (imageFile) {
      formData.append("project_image", imageFile);
    }
    return formData;
  };

  const handleImageFile = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: buildFormData(),
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Project updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/projects/${id}`);
      } else {
        throw new Error(result.message || "Failed to update project");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to update project",
        icon: "error",
        confirmButtonColor: BRAND_BLUE,
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => form.start_date !== "";

  const headerBackSx = {
    color: "white",
    borderColor: "rgba(255, 255, 255, 0.4)",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      borderColor: BRAND_GOLD,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  };

  const headerSaveSx = {
    textTransform: "none",
    fontWeight: 700,
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: `1px solid rgba(245, 197, 24, 0.5)`,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      borderColor: BRAND_GOLD,
    },
    "&:disabled": {
      color: "rgba(255, 255, 255, 0.5)",
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  };

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box display="flex" alignItems="center" gap={1} mb={{ xs: 2, sm: 3 }}>
      <Icon sx={{ color: BRAND_BLUE, fontSize: { xs: 24, sm: 28 } }} />
      <Typography variant="h5" sx={sectionTitleSx}>
        {title}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{ ...pageBackground, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress sx={{ color: BRAND_BLUE }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ...pageBackground, py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/projects")}
            sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ ...pageBackground, py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 2 }}>
            Project not found
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/projects")}
            sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageBackground, py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Card sx={cardSx}>
          <Box sx={{ ...headerGradient, p: { xs: 2, sm: 3 }, position: "relative", overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "50%",
              }}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={{ xs: 2, sm: 0 }}
              position="relative"
              zIndex={1}
            >
              <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} flexWrap="wrap">
                <IconButton
                  onClick={() => navigate(`/projects/${id}`)}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
                      wordBreak: "break-word",
                    }}
                  >
                    Edit Project
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {project.name}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={!isFormValid() || saving}
                sx={{ ...headerSaveSx, width: { xs: "100%", sm: "auto" } }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeader icon={ImageIcon} title="Project Photo" />
            <Box sx={{ mb: 3 }}>
              <ProjectImageUpload
                preview={imagePreview}
                onFile={handleImageFile}
                onInvalidFile={() =>
                  Swal.fire({ icon: "error", title: "Invalid file", text: "Please choose an image file (JPG, PNG, GIF)." })
                }
              />
            </Box>

            <SectionHeader icon={Construction} title="Basic Information" />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Project Name"
                value={form.name}
                disabled
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Location"
                value={form.location_name}
                disabled
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="e.g. Residential, Commercial"
                sx={fieldSx}
              />
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: statusColors[status]?.color || BRAND_BLUE,
                          }}
                        />
                        {formatStatus(status)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
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
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Progress (%)"
                type="number"
                placeholder="Enter percentage"
                value={form.progress_percent}
                onChange={(e) => handleChange("progress_percent", sanitizeProgressInput(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
                sx={percentFieldSx}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                sx={fieldSx}
              />
            </Stack>

            <Divider sx={{ my: { xs: 3, sm: 4 }, borderColor: "rgba(26, 95, 180, 0.12)" }} />

            <SectionHeader icon={AttachMoney} title="Financial Information" />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Budget Estimate"
                type="number"
                value={form.budget_estimate}
                onChange={(e) => handleChange("budget_estimate", e.target.value)}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Actual Cost"
                type="number"
                value={form.actual_cost}
                onChange={(e) => handleChange("actual_cost", e.target.value)}
                sx={fieldSx}
              />
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  label="Currency"
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider sx={{ my: { xs: 3, sm: 4 }, borderColor: "rgba(26, 95, 180, 0.12)" }} />

            <SectionHeader icon={Person} title="Client" />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Client Name"
                value={form.client_name}
                onChange={(e) => handleChange("client_name", e.target.value)}
                sx={fieldSx}
              />
            </Stack>

            <Stack spacing={2} mt={{ xs: 3, sm: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={!isFormValid() || saving}
                sx={{ ...primaryButtonSx, py: { xs: 1.5, sm: 1.75 } }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate(`/projects/${id}`)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  color: BRAND_BLUE,
                  borderColor: "rgba(26, 95, 180, 0.4)",
                  py: { xs: 1.5, sm: 1.75 },
                  "&:hover": {
                    borderColor: BRAND_BLUE,
                    backgroundColor: "rgba(26, 95, 180, 0.06)",
                  },
                }}
              >
                Cancel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ProjectEdit;
