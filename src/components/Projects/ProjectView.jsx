import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Container,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  InfoOutlined,
  EventNote,
  AttachMoney as MoneyIcon,
  Engineering,
  Assignment as TaskIcon,
  Build as MaterialIcon,
  Construction as EquipmentIcon,
  TrendingUp as ProgressIcon,
  Warning as IssueIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Bolt,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import QuotationGenerator from "./QuotationGenerator";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  cardSx,
  sectionTitleSx,
  statusColors,
  taskStatusColors,
  TASK_STATUSES,
  formatStatus,
  primaryButtonSx,
  buildImageUrl,
  percentFieldSx,
  formatProgressInput,
  parseProgressPercent,
  sanitizeProgressInput,
} from "./projectTheme";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

const formatCurrency = (amount, currency = "KES") => {
  if (amount === null || amount === undefined || amount === "") return "Not specified";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(amount);
};

const isImageFile = (name) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name || "");

const labelSx = {
  color: "text.secondary",
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const progressBarSx = (color) => ({
  height: 8,
  borderRadius: 4,
  bgcolor: "rgba(26,95,180,0.12)",
  "& .MuiLinearProgress-bar": { borderRadius: 4, background: color },
});

const dialogFieldSx = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND_BLUE },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND_BLUE },
};

const headerBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  color: "white",
  borderColor: "rgba(255,255,255,0.4)",
  "&:hover": { borderColor: BRAND_GOLD, bgcolor: "rgba(255,255,255,0.1)" },
};

const headerActionSx = {
  ...headerBtnSx,
  bgcolor: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(245,197,24,0.45)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.22)", borderColor: BRAND_GOLD },
};

const StatusChip = ({ status, onDark = false, kind = "project" }) => {
  const palette = kind === "task" ? taskStatusColors : statusColors;
  const s = palette[status] || statusColors.on_hold;
  if (onDark) {
    return (
      <Chip
        label={formatStatus(status)}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          height: { xs: 24, sm: 26 },
          bgcolor: "rgba(255,255,255,0.95)",
          color: BRAND_BLUE_DARK,
          border: `1px solid ${BRAND_GOLD}`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
        }}
      />
    );
  }
  return (
    <Chip
      label={formatStatus(status)}
      size="small"
      sx={{ fontWeight: 700, bgcolor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}
    />
  );
};

const CategoryChip = ({ label, onDark = false }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      fontWeight: 700,
      fontSize: { xs: "0.7rem", sm: "0.75rem" },
      height: { xs: 24, sm: 26 },
      maxWidth: "100%",
      ...(onDark
        ? {
            bgcolor: BRAND_GOLD,
            color: BRAND_BLUE_DARK,
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
          }
        : {
            bgcolor: "rgba(245,197,24,0.2)",
            color: "#9a7b00",
          }),
    }}
  />
);

const DetailRow = ({ label, value, children, accent }) => (
  <Box
    sx={{
      width: "100%",
      p: { xs: 1.75, sm: 2 },
      borderRadius: 2,
      border: `1px solid ${accent ? "rgba(245,197,24,0.35)" : "rgba(26,95,180,0.14)"}`,
      bgcolor: accent ? "rgba(245,197,24,0.06)" : "rgba(26,95,180,0.03)",
      boxSizing: "border-box",
    }}
  >
    <Typography sx={labelSx}>{label}</Typography>
    {children ?? (
      <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.95rem", sm: "1rem" }, mt: 0.75, wordBreak: "break-word", color: "#1a1a2e" }}>
        {value}
      </Typography>
    )}
  </Box>
);

const SectionCard = ({ step, icon: Icon, title, hint, count, actions, children }) => (
  <Card
    sx={{
      ...cardSx,
      mb: { xs: 2, sm: 2.5 },
      transition: "box-shadow 0.25s ease",
      "&:hover": { boxShadow: "0 12px 40px rgba(26, 95, 180, 0.12)" },
    }}
  >
    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD})` }} />
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} mb={2} flexWrap="wrap">
        <Stack direction="row" alignItems="flex-start" spacing={1.5} flex={1} minWidth={0}>
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
            {step != null && (
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
            )}
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" sx={{ ...sectionTitleSx, lineHeight: 1.3 }}>
              {title}
              {count != null && (
                <Typography component="span" sx={{ color: BRAND_GOLD, ml: 0.75 }}>
                  ({count})
                </Typography>
              )}
            </Typography>
            {hint && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                {hint}
              </Typography>
            )}
          </Box>
        </Stack>
        {actions}
      </Stack>
      {children}
    </CardContent>
  </Card>
);

const emptyTaskForm = {
  name: "",
  description: "",
  start_date: "",
  due_date: "",
  assigned_to_admin: "",
};

const emptyProgressForm = {
  status: "pending",
  description: "",
  progress_percent: "",
  date: new Date().toISOString().split("T")[0],
  images: [],
};

const taskNeedsProgressNote = (task, nextStatus, nextProgress) => {
  if (!task) return false;
  const statusChangingFromPending =
    nextStatus && task.status === "pending" && nextStatus !== "pending";
  const statusChangingToCompleted =
    nextStatus && task.status === "in_progress" && nextStatus === "completed";
  const progressChangingFromZero =
    nextProgress !== undefined && (task.progress_percent ?? 0) === 0 && nextProgress > 0;
  return statusChangingFromPending || statusChangingToCompleted || progressChangingFromZero;
};

const TaskViewCard = ({ task, onLogProgress }) => {
  const progress = task?.progress_percent ?? 0;
  const taskUpdates = (task?.progressUpdates || []).slice().sort(
    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  return (
    <Stack spacing={2}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          border: `1px solid rgba(26, 95, 180, 0.14)`,
          background: "linear-gradient(160deg, #f8fbff 0%, #fffef8 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          mb={2}
        >
          <Box minWidth={0}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND_BLUE, fontSize: { xs: "1.05rem", sm: "1.2rem" }, wordBreak: "break-word" }}>
              {task.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mt={0.75}>
              <StatusChip status={task.status || "pending"} kind="task" />
              <Typography variant="body2" fontWeight={700} color="#9a7b00">
                {progress}% complete
              </Typography>
            </Stack>
          </Box>
          {onLogProgress && (
            <Button
              size="small"
              variant="contained"
              startIcon={<ProgressIcon />}
              onClick={onLogProgress}
              sx={{ ...primaryButtonSx, flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
            >
              Log Progress
            </Button>
          )}
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2,
            bgcolor: "rgba(26,95,180,0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD})`,
            },
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 1.25, sm: 1.5 },
          }}
        >
          <DetailRow label="Assigned To" value={task.assignedAdmin?.name || "—"} />
          <DetailRow label="Start Date" value={formatDate(task.start_date)} />
          <DetailRow label="Due Date" value={formatDate(task.due_date)} />
          <DetailRow label="Last Updated" value={formatDate(task.updatedAt)} />
        </Box>

        {task.description && (
          <Box sx={{ mt: 2 }}>
            <DetailRow label="Description" value={task.description} />
          </Box>
        )}
      </Paper>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND_BLUE, mb: 1 }}>
          Progress history ({taskUpdates.length})
        </Typography>
        {taskUpdates.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No progress updates logged for this task yet.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {taskUpdates.map((update) => (
              <Paper
                key={update.id}
                variant="outlined"
                sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, borderColor: "rgba(26,95,180,0.12)" }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={0.5} mb={0.75}>
                  <Typography variant="body2" fontWeight={700} color={BRAND_BLUE}>
                    {update.progress_percent ?? 0}% milestone
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(update.date || update.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  {update.description}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: "", fileName: "" });
  const [quotationModal, setQuotationModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState(emptyTaskForm);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [progressSubmitting, setProgressSubmitting] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);
  const [progressForm, setProgressForm] = useState(emptyProgressForm);
  const [progressDialogMode, setProgressDialogMode] = useState("create");
  const [editingProgressUpdate, setEditingProgressUpdate] = useState(null);
  const [openTaskViewDialog, setOpenTaskViewDialog] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState(null);

  const fetchProject = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }
      const res = await fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) setProject(result.data);
      else setError(result.message || "Failed to fetch project details");
    } catch {
      setError("Failed to fetch project details");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/admins", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setAdmins(result.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchProject();
    fetchAdmins();
  }, [fetchProject, fetchAdmins]);

  const related = useMemo(() => {
    if (!project) return { tasks: [], materials: [], equipment: [], budgets: [], progressUpdates: [], issues: [] };
    const tasks = project.tasks || [];
    const flat = (key) => tasks.flatMap((t) => t[key] || []);
    return {
      tasks,
      materials: project.materials?.length ? project.materials : flat("materials"),
      equipment: project.equipment?.length ? project.equipment : flat("equipment"),
      budgets: project.budgets?.length ? project.budgets : flat("budgets"),
      progressUpdates: (
        project.progressUpdates?.length
          ? project.progressUpdates.map((u) => ({ ...u, taskName: u.taskName || u.task?.name }))
          : tasks.flatMap((t) =>
              (t.progressUpdates || []).map((u) => ({ ...u, taskName: t.name, taskId: t.id }))
            )
      ).sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
      ),
      issues: project.issues || [],
    };
  }, [project]);

  const progressImagePreviews = useMemo(
    () =>
      progressForm.images.map((file, index) => ({
        index,
        name:
          file instanceof File
            ? file.name
            : (typeof file === "string" ? file.split("/").pop() : null) || `Image ${index + 1}`,
        url: file instanceof File ? URL.createObjectURL(file) : buildImageUrl(file),
        isObjectUrl: file instanceof File,
      })),
    [progressForm.images]
  );

  useEffect(
    () => () => {
      progressImagePreviews.forEach((preview) => {
        if (preview.isObjectUrl) URL.revokeObjectURL(preview.url);
      });
    },
    [progressImagePreviews]
  );

  const handleAddProgressImages = (event) => {
    const newFiles = Array.from(event.target.files || []);
    if (!newFiles.length) return;
    setProgressForm((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
    event.target.value = "";
  };

  const handleRemoveProgressImage = (index) => {
    setProgressForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const closeProgressDialog = () => {
    setOpenProgressDialog(false);
    setSelectedTaskForProgress(null);
    setProgressForm(emptyProgressForm);
    setProgressDialogMode("create");
    setEditingProgressUpdate(null);
  };

  const openCreateTask = () => {
    setCreateTaskForm({
      ...emptyTaskForm,
      assigned_to_admin: project?.engineer_in_charge || project?.engineer?.id || "",
    });
    setOpenCreateTaskDialog(true);
  };

  const openProgressForTask = (task = null) => {
    setProgressDialogMode("create");
    setEditingProgressUpdate(null);
    setSelectedTaskForProgress(task);
    setProgressForm({
      ...emptyProgressForm,
      status: task?.status || "pending",
      progress_percent: formatProgressInput(task?.progress_percent),
      date: new Date().toISOString().split("T")[0],
    });
    setOpenProgressDialog(true);
  };

  const openEditProgressUpdate = (update) => {
    const taskId = update.taskId || update.task_id || update.task?.id;
    const task = related.tasks?.find((t) => t.id === taskId) || update.task || null;

    setProgressDialogMode("edit");
    setEditingProgressUpdate(update);
    setSelectedTaskForProgress(task);
    setProgressForm({
      status: task?.status || "pending",
      description: update.description || "",
      progress_percent: formatProgressInput(update.progress_percent),
      date: (update.date || "").toString().split("T")[0] || new Date().toISOString().split("T")[0],
      images: Array.isArray(update.images) ? [...update.images] : [],
    });
    setOpenProgressDialog(true);
  };

  const openTaskViewDialogFor = (task) => {
    setSelectedTaskForView(task);
    setOpenTaskViewDialog(true);
  };

  const openProgressFromTaskView = () => {
    const task = selectedTaskForView;
    setOpenTaskViewDialog(false);
    setSelectedTaskForView(null);
    if (task) openProgressForTask(task);
  };

  const handleCreateTask = async () => {
    if (!createTaskForm.name?.trim() || !createTaskForm.start_date || !createTaskForm.due_date || !createTaskForm.assigned_to_admin) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Please fill in all required fields." });
      return;
    }
    try {
      setTaskSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...createTaskForm, project_id: id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create task");
      setOpenCreateTaskDialog(false);
      setCreateTaskForm(emptyTaskForm);
      await fetchProject({ silent: true });
      Swal.fire({ icon: "success", title: "Task created", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to create task." });
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleProgressUpdateSubmit = async () => {
    if (!selectedTaskForProgress?.id || !progressForm.description?.trim() || !progressForm.date) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Select a task and fill in description and date." });
      return;
    }

    const isEdit = progressDialogMode === "edit" && editingProgressUpdate?.id;
    const nextProgress = parseProgressPercent(
      progressForm.progress_percent,
      selectedTaskForProgress.progress_percent ?? 0
    );
    const nextStatus = progressForm.status;
    const statusChanged = nextStatus !== selectedTaskForProgress.status;
    const progressChanged = nextProgress !== (selectedTaskForProgress.progress_percent ?? 0);

    try {
      setProgressSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("task_id", selectedTaskForProgress.id);
      formData.append("description", progressForm.description.trim());
      formData.append("progress_percent", nextProgress);
      formData.append("date", progressForm.date);

      const existingImages = progressForm.images.filter((img) => typeof img === "string");
      if (isEdit) {
        formData.append("existing_images", JSON.stringify(existingImages));
      }

      progressForm.images.forEach((file) => {
        if (file instanceof File) formData.append("progress_images", file);
      });

      const res = await fetch(
        isEdit ? `/api/progress-updates/${editingProgressUpdate.id}` : "/api/progress-updates",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || `Failed to ${isEdit ? "update" : "log"} progress update`);
      }

      if (statusChanged || progressChanged) {
        const statusRes = await fetch(`/api/tasks/${selectedTaskForProgress.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
            progress_percent: nextProgress,
            progress_update_already_created: true,
          }),
        });
        const statusResult = await statusRes.json();
        if (!statusRes.ok) {
          throw new Error(statusResult.message || "Progress saved but task status could not be updated.");
        }
      }

      closeProgressDialog();
      await fetchProject({ silent: true });
      Swal.fire({
        icon: "success",
        title: isEdit ? "Progress updated" : "Progress logged",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || `Failed to ${progressDialogMode === "edit" ? "update" : "log"} progress update.`,
      });
    } finally {
      setProgressSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ ...pageBackground, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: BRAND_BLUE }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ ...pageBackground, py: 4 }}>
        <Container maxWidth="md">
          <Alert severity={error ? "error" : "warning"} sx={{ mb: 2, borderRadius: 2 }}>
            {error || "Project not found"}
          </Alert>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE }}>
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  const progress = project.progress_percent ?? 0;
  const budgetNum = parseFloat(project.budget_estimate) || 0;
  const actualNum = parseFloat(project.actual_cost) || 0;
  const budgetUsedPct = budgetNum > 0 ? Math.min(100, Math.round((actualNum / budgetNum) * 100)) : 0;
  const overBudget = actualNum > budgetNum && budgetNum > 0;

  const desktopHeaderActions = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
      <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => setQuotationModal(true)} sx={{ ...headerActionSx, width: { xs: "100%", sm: "auto" }, fontSize: { sm: "0.875rem" } }}>
        Generate Invoice
      </Button>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={() => navigate(`/projects/${id}/edit`)}
        sx={{
          ...primaryButtonSx,
          width: { xs: "100%", sm: "auto" },
          color: "white",
          bgcolor: "rgba(255,255,255,0.18)",
          border: `2px solid ${BRAND_GOLD}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.28)", borderColor: BRAND_GOLD },
        }}
      >
        Edit Project
      </Button>
    </Stack>
  );

  const mobileHeaderActions = (
    <Stack direction="column" spacing={1} sx={{ width: "100%", mt: 1.5 }}>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<PdfIcon />}
        onClick={() => setQuotationModal(true)}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.875rem",
          py: 1.15,
          color: BRAND_BLUE_DARK,
          borderColor: BRAND_BLUE,
          bgcolor: "#fff",
          borderWidth: 2,
          "&:hover": { borderColor: BRAND_BLUE_DARK, bgcolor: "rgba(255,255,255,0.92)", borderWidth: 2 },
        }}
      >
        Generate Invoice
      </Button>
      <Button
        variant="contained"
        fullWidth
        startIcon={<EditIcon />}
        onClick={() => navigate(`/projects/${id}/edit`)}
        sx={{
          ...primaryButtonSx,
          py: 1.15,
          fontSize: "0.875rem",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        }}
      >
        Edit Project
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ ...pageBackground, pb: { xs: 2, sm: 4 } }}>
      {/* Mobile sticky header */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "sticky",
          top: 0,
          zIndex: 1100,
          ...headerGradient,
          px: 1.5,
          py: 1.5,
          boxShadow: "0 4px 20px rgba(26,95,180,0.25)",
          color: "#fff",
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <IconButton onClick={() => navigate("/projects")} sx={{ color: "#fff", p: 0.75, mt: 0.25, bgcolor: "rgba(255,255,255,0.12)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1} minWidth={0}>
            <Typography fontWeight={800} fontSize="1rem" lineHeight={1.35} sx={{ color: "#fff", wordBreak: "break-word" }}>
              {project.name}
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.75} mt={0.75} flexWrap="wrap" useFlexGap>
              <StatusChip status={project.status} onDark />
              {project.category && <CategoryChip label={project.category} onDark />}
              <Typography variant="body2" sx={{ color: BRAND_GOLD, fontWeight: 800, fontSize: "0.8rem" }}>
                {progress}%
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1.25,
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              background: `linear-gradient(90deg, ${BRAND_GOLD}, #fff8dc)`,
            },
          }}
        />
        {mobileHeaderActions}
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 2, md: 4 } }}>
        {project.image && (
          <Box
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(26,95,180,0.12)",
              boxShadow: "0 12px 32px rgba(26,95,180,0.12)",
            }}
          >
            <Box
              component="img"
              src={buildImageUrl(project.image)}
              alt={project.name}
              sx={{
                width: "100%",
                maxHeight: { xs: 220, sm: 280, md: 320 },
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        )}

        {/* Desktop hero */}
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
          <Box sx={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(245,197,24,0.12)" }} />
          <Stack spacing={2} position="relative" zIndex={1}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
                <IconButton onClick={() => navigate("/projects")} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
                  <ArrowBackIcon />
                </IconButton>
                <Box
                  component="img"
                  src="/logo.png"
                  alt="SafeWire"
                  sx={{ height: 44, display: { xs: "none", lg: "block" } }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <Box minWidth={0}>
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Bolt sx={{ color: BRAND_GOLD }} />
                    <Typography variant="h4" fontWeight={800} sx={{ wordBreak: "break-word", color: "#fff" }}>
                      {project.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1} mt={1} flexWrap="wrap" useFlexGap>
                    <StatusChip status={project.status} onDark />
                    {project.category && <CategoryChip label={project.category} onDark />}
                  </Stack>
                </Box>
              </Stack>
              <Box textAlign="right">
                <Typography variant="h4" fontWeight={800} color={BRAND_GOLD}>
                  {progress}%
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  overall progress
                </Typography>
              </Box>
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.15)", "& .MuiLinearProgress-bar": { borderRadius: 4, background: `linear-gradient(90deg, ${BRAND_GOLD}, #fff8dc)` } }} />
            {desktopHeaderActions}
          </Stack>
        </Box>

        {/* 1 — Basic Info */}
        <SectionCard step={1} icon={InfoOutlined} title="Basic Info" hint="Project identity and site details">
          <Stack spacing={2}>
            <DetailRow label="Project Name" value={project.name} accent />
            <DetailRow label="Location" value={project.location_name} />
            {project.category && <DetailRow label="Category" value={project.category} />}
            <DetailRow label="Description">
              <Typography sx={{ mt: 0.75, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#1a1a2e" }}>
                {project.description || "Not specified"}
              </Typography>
            </DetailRow>
          </Stack>
        </SectionCard>

        {/* 2 — Schedule & Status */}
        <SectionCard step={2} icon={EventNote} title="Schedule & Status" hint="Timeline and current stage">
          <Stack spacing={2}>
            <DetailRow label="Status">
              <Box mt={0.75}><StatusChip status={project.status} /></Box>
            </DetailRow>
            <DetailRow label="Progress">
              <Box mt={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                  <Typography fontWeight={700} color={BRAND_BLUE}>{progress}% complete</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={progressBarSx(`linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD})`)} />
              </Box>
            </DetailRow>
            <DetailRow label="Start Date" value={formatDate(project.start_date)} />
            <DetailRow label="End Date" value={formatDate(project.end_date)} />
          </Stack>
        </SectionCard>

        {/* 3 — Financial */}
        <SectionCard step={3} icon={MoneyIcon} title="Financial" hint="Budget and spend tracking">
          <Stack spacing={2}>
            <DetailRow label="Budget Estimate" value={formatCurrency(project.budget_estimate, project.currency)} />
            <DetailRow label="Actual Cost">
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", mt: 0.75, color: overBudget ? "#c62828" : BRAND_BLUE }}>
                {formatCurrency(project.actual_cost, project.currency)}
              </Typography>
            </DetailRow>
            <DetailRow label="Currency" value={project.currency} />
            {budgetNum > 0 && (
              <DetailRow label="Budget Utilization">
                <Box mt={1}>
                  <Stack direction="row" justifyContent="space-between" mb={0.75}>
                    <Typography variant="body2" fontWeight={600} color={overBudget ? "#c62828" : "#9a7b00"}>
                      {budgetUsedPct}% used
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Remaining: {formatCurrency(Math.max(0, budgetNum - actualNum), project.currency)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={budgetUsedPct}
                    sx={progressBarSx(overBudget ? "#c62828" : BRAND_GOLD)}
                  />
                </Box>
              </DetailRow>
            )}
          </Stack>
        </SectionCard>

        {/* 4 — Client & Engineer */}
        <SectionCard step={4} icon={Engineering} title="Client & Engineer" hint="Stakeholders for this project">
          <Stack spacing={2}>
            <DetailRow label="Client Name" value={project.client_name} />
            {project.engineer ? (
              <DetailRow label="Engineer in Charge">
                <Stack direction="row" alignItems="center" spacing={1.5} mt={1}>
                  <Avatar sx={{ bgcolor: BRAND_BLUE, border: `2px solid ${BRAND_GOLD}`, width: 48, height: 48 }}>
                    {project.engineer.name?.charAt(0)}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography fontWeight={700}>{project.engineer.name}</Typography>
                    <Stack direction="row" alignItems="center" gap={0.5} mt={0.25}>
                      <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>{project.engineer.email}</Typography>
                    </Stack>
                    {project.engineer.phone && (
                      <Stack direction="row" alignItems="center" gap={0.5} mt={0.25}>
                        <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">{project.engineer.phone}</Typography>
                      </Stack>
                    )}
                    {project.engineer.role && (
                      <Chip label={formatStatus(project.engineer.role)} size="small" sx={{ mt: 0.75, height: 22, fontSize: "0.7rem", bgcolor: "rgba(26,95,180,0.1)", color: BRAND_BLUE }} />
                    )}
                  </Box>
                </Stack>
              </DetailRow>
            ) : (
              <DetailRow label="Engineer in Charge" value="Not assigned" />
            )}
          </Stack>
        </SectionCard>

        {/* 5 — Tasks */}
        <SectionCard
          step={5}
          icon={TaskIcon}
          title="Project Tasks"
          hint="Work items and on-site progress"
          count={related.tasks.length}
          actions={
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openCreateTask} sx={{ ...primaryButtonSx, py: 0.5, px: 1.5, fontSize: "0.8rem" }}>
              Add Task
            </Button>
          }
        >
          {related.tasks.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3, px: 2, borderRadius: 2, bgcolor: "rgba(26,95,180,0.04)", border: "1px dashed rgba(26,95,180,0.2)" }}>
              <TaskIcon sx={{ fontSize: 40, color: BRAND_BLUE, opacity: 0.35, mb: 1 }} />
              <Typography color="text.secondary" mb={2}>No tasks yet for this project.</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateTask} sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE, textTransform: "none" }}>
                Add First Task
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "rgba(26,95,180,0.15)", width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table
                size="small"
                sx={{
                  width: "100%",
                  tableLayout: { xs: "auto", md: "fixed" },
                  minWidth: { xs: 0, sm: 480 },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(26,95,180,0.06)" }}>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, width: { xs: 36, sm: 48 }, minWidth: { xs: 36, sm: 48 }, px: { xs: 1, sm: 2 } }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, px: { xs: 1, sm: 2 } }}>Task</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, display: { xs: "none", md: "table-cell" }, width: "14%", px: { xs: 1, sm: 2 } }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, display: { xs: "none", sm: "table-cell" }, px: { xs: 1, sm: 2 } }}>Assigned</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: BRAND_BLUE,
                        width: { xs: 52, sm: 88 },
                        minWidth: { xs: 52, sm: 88 },
                        px: { xs: 0.75, sm: 2 },
                        whiteSpace: "nowrap",
                      }}
                      align="center"
                    >
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        Actions
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          display: { xs: "inline-flex", sm: "none" },
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.72rem",
                          letterSpacing: 0.2,
                        }}
                      >
                        View
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {related.tasks.map((task, index) => (
                    <TableRow key={task.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: BRAND_BLUE, px: { xs: 1, sm: 2 } }}>{index + 1}</TableCell>
                      <TableCell sx={{ px: { xs: 1, sm: 2 }, minWidth: 0 }}>
                        <Typography fontWeight={600} color={BRAND_BLUE} fontSize="0.875rem" sx={{ wordBreak: "break-word" }}>{task.name}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" mt={0.5}>
                          <Box sx={{ display: { xs: "inline-flex", md: "none" } }}>
                            <StatusChip status={task.status || "pending"} kind="task" />
                          </Box>
                          <Typography variant="caption" fontWeight={700} color="#9a7b00">{task.progress_percent ?? 0}%</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "block", sm: "none" } }}>
                          {task.assignedAdmin?.name || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        <StatusChip status={task.status || "pending"} kind="task" />
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, px: { xs: 1, sm: 2 } }}>{task.assignedAdmin?.name || "—"}</TableCell>
                      <TableCell align="center" sx={{ width: { xs: 52, sm: 88 }, minWidth: { xs: 52, sm: 88 }, px: { xs: 0.5, sm: 2 } }}>
                        <Tooltip title="View task">
                          <IconButton
                            size="small"
                            onClick={() => openTaskViewDialogFor(task)}
                            sx={{ color: BRAND_BLUE, bgcolor: "rgba(26,95,180,0.08)" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>

        {/* 6 — Progress Updates */}
        <SectionCard
          step={6}
          icon={ProgressIcon}
          title="Progress Updates"
          hint="Logged milestones and site photos"
          count={related.progressUpdates.length}
          actions={
            related.tasks.length > 0 ? (
              <Button size="small" variant="outlined" startIcon={<ProgressIcon />} onClick={() => openProgressForTask()} sx={{ textTransform: "none", fontWeight: 600, color: BRAND_BLUE, borderColor: BRAND_BLUE }}>
                Add Update
              </Button>
            ) : null
          }
        >
          {related.progressUpdates.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 1 }}>
              No progress updates yet. Add a task, then log progress from the task row.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {related.progressUpdates.map((u, i) => (
                <Box
                  key={u.id || i}
                  sx={{
                    width: "100%",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(26,95,180,0.12)",
                    bgcolor: "rgba(26,95,180,0.03)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={700} color={BRAND_BLUE}>{u.taskName || "Progress Update"}</Typography>
                      {u.date && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                          {formatDate(u.date)}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                      <Chip label={`${u.progress_percent ?? 0}%`} size="small" sx={{ bgcolor: "rgba(245,197,24,0.2)", color: "#9a7b00", fontWeight: 700 }} />
                      <Tooltip title="Edit progress update">
                        <IconButton
                          size="small"
                          onClick={() => openEditProgressUpdate(u)}
                          sx={{ color: BRAND_BLUE, bgcolor: "rgba(26,95,180,0.08)" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={1}>{u.description}</Typography>
                  {u.images?.length > 0 && (
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1.5}>
                      {u.images.map((img, idx) => {
                        const fileName = img.split("/").pop() || `Image ${idx + 1}`;
                        if (!isImageFile(fileName)) return null;
                        return (
                          <Box
                            key={idx}
                            component="img"
                            src={buildImageUrl(img)}
                            alt={fileName}
                            onClick={() => setPreview({ open: true, url: buildImageUrl(img), fileName })}
                            sx={{
                              width: 72,
                              height: 72,
                              objectFit: "cover",
                              borderRadius: 1.5,
                              cursor: "pointer",
                              border: "2px solid rgba(26,95,180,0.15)",
                              "&:hover": { borderColor: BRAND_GOLD },
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </SectionCard>

        {/* Materials */}
        {related.materials.length > 0 && (
          <SectionCard icon={MaterialIcon} title="Materials" count={related.materials.length} hint="Supplies linked to project tasks">
            <Stack spacing={2}>
              {related.materials.map((m, i) => (
                <DetailRow key={m.id || i} label={m.name}>
                  <Stack spacing={0.25} mt={0.5}>
                    {m.unit && <Typography variant="body2" color="text.secondary">Unit: {m.unit}</Typography>}
                    {m.unit_cost != null && <Typography variant="body2" color="text.secondary">Cost: {formatCurrency(m.unit_cost, project.currency)}</Typography>}
                    {(m.quantity_required != null || m.quantity_used != null) && (
                      <Typography variant="body2" color="text.secondary">Qty: {m.quantity_used ?? 0} / {m.quantity_required ?? "—"}</Typography>
                    )}
                  </Stack>
                </DetailRow>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Equipment */}
        {related.equipment.length > 0 && (
          <SectionCard icon={EquipmentIcon} title="Equipment" count={related.equipment.length} hint="Tools and machinery in use">
            <Stack spacing={2}>
              {related.equipment.map((eq, i) => (
                <DetailRow key={eq.id || i} label={eq.name}>
                  <Stack spacing={0.25} mt={0.5}>
                    {eq.type && <Typography variant="body2" color="text.secondary">Type: {eq.type}</Typography>}
                    {eq.availability && <Typography variant="body2" color="text.secondary">Availability: {formatStatus(eq.availability)}</Typography>}
                    {eq.rental_cost_per_day != null && (
                      <Typography variant="body2" color="text.secondary">Daily rate: {formatCurrency(eq.rental_cost_per_day, project.currency)}</Typography>
                    )}
                  </Stack>
                </DetailRow>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Budget details */}
        {related.budgets.length > 0 && (
          <SectionCard icon={MoneyIcon} title="Budget Line Items" count={related.budgets.length}>
            <Stack spacing={2}>
              {related.budgets.map((b, i) => (
                <DetailRow key={b.id || i} label={b.category || b.name || `Item ${i + 1}`} value={formatCurrency(b.amount, project.currency)} />
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Issues */}
        {related.issues.length > 0 && (
          <SectionCard icon={IssueIcon} title="Issues" count={related.issues.length} hint="Reported problems on this project">
            <Stack spacing={2}>
              {related.issues.map((issue, i) => (
                <Box
                  key={issue.id || i}
                  sx={{
                    width: "100%",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(198,40,40,0.2)",
                    bgcolor: "rgba(198,40,40,0.04)",
                  }}
                >
                  <Typography fontWeight={700} color="#c62828">{issue.name || "Issue"}</Typography>
                  {issue.description && <Typography variant="body2" color="text.secondary" mt={0.5} mb={1}>{issue.description}</Typography>}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {issue.status && <StatusChip status={issue.status} />}
                    {issue.category && <Chip label={issue.category} size="small" variant="outlined" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>Reported {formatDate(issue.createdAt)}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Bottom actions — mobile friendly */}
        <Card sx={{ ...cardSx, mt: 1 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Divider sx={{ mb: 2, borderColor: "rgba(26,95,180,0.1)" }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button fullWidth variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ textTransform: "none", fontWeight: 600, color: BRAND_BLUE, borderColor: BRAND_BLUE, py: 1.25 }}>
                Back to Projects
              </Button>
              <Button fullWidth variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/projects/${id}/edit`)} sx={{ ...primaryButtonSx, py: 1.25 }}>
                Edit Project
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* Image preview */}
      {preview.open && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, p: 2 }} onClick={() => setPreview({ open: false, url: "", fileName: "" })}>
          <Box sx={{ bgcolor: "white", borderRadius: 3, p: 3, maxWidth: "92%", maxHeight: "92%", border: `3px solid ${BRAND_GOLD}` }} onClick={(e) => e.stopPropagation()}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
              <Typography variant="h6" color={BRAND_BLUE} fontWeight={700}>{preview.fileName}</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => window.open(preview.url, "_blank")} sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE }}>Download</Button>
                <Button variant="contained" size="small" startIcon={<CloseIcon />} onClick={() => setPreview({ open: false, url: "", fileName: "" })} sx={primaryButtonSx}>Close</Button>
              </Stack>
            </Stack>
            <Box component="img" src={preview.url} alt={preview.fileName} sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 2, display: "block" }} />
          </Box>
        </Box>
      )}

      <QuotationGenerator projectId={id} projectName={project.name} open={quotationModal} onClose={() => setQuotationModal(false)} />

      {/* Create Task Dialog */}
      <Dialog open={openCreateTaskDialog} onClose={() => !taskSubmitting && setOpenCreateTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ...headerGradient, color: "white", fontWeight: 700 }}>Add Task</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Task Name" required fullWidth size="small" value={createTaskForm.name} onChange={(e) => setCreateTaskForm({ ...createTaskForm, name: e.target.value })} sx={dialogFieldSx} />
            <TextField label="Description" fullWidth size="small" multiline rows={3} value={createTaskForm.description} onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} sx={dialogFieldSx} />
            <FormControl fullWidth size="small" required sx={dialogFieldSx}>
              <InputLabel>Assigned To</InputLabel>
              <Select label="Assigned To" value={createTaskForm.assigned_to_admin} onChange={(e) => setCreateTaskForm({ ...createTaskForm, assigned_to_admin: e.target.value })}>
                {admins.map((admin) => (
                  <MenuItem key={admin.id} value={admin.id}>{admin.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Start Date" type="date" required fullWidth size="small" InputLabelProps={{ shrink: true }} value={createTaskForm.start_date} onChange={(e) => setCreateTaskForm({ ...createTaskForm, start_date: e.target.value })} sx={dialogFieldSx} />
            <TextField label="Due Date" type="date" required fullWidth size="small" InputLabelProps={{ shrink: true }} value={createTaskForm.due_date} onChange={(e) => setCreateTaskForm({ ...createTaskForm, due_date: e.target.value })} sx={dialogFieldSx} />
            <Typography variant="caption" color="text.secondary">Project: {project.name}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreateTaskDialog(false)} disabled={taskSubmitting} sx={{ color: BRAND_BLUE }}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={taskSubmitting} sx={primaryButtonSx}>
            {taskSubmitting ? <CircularProgress size={22} color="inherit" /> : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={openProgressDialog} onClose={() => !progressSubmitting && closeProgressDialog()} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ...headerGradient, color: "white", fontWeight: 700 }}>
          {progressDialogMode === "edit" ? "Edit Progress Update" : "Log Progress Update"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small" required sx={dialogFieldSx}>
              <InputLabel>Task</InputLabel>
              <Select
                label="Task"
                value={selectedTaskForProgress?.id || ""}
                onChange={(e) => {
                  const task = related.tasks?.find((t) => t.id === e.target.value);
                  setSelectedTaskForProgress(task || null);
                  if (task) {
                    setProgressForm((prev) => ({
                      ...prev,
                      status: task.status || "pending",
                      ...(progressDialogMode === "create"
                        ? { progress_percent: formatProgressInput(task.progress_percent) }
                        : {}),
                    }));
                  }
                }}
              >
                {(related.tasks || []).map((task) => (
                  <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required sx={dialogFieldSx}>
              <InputLabel>Task Status</InputLabel>
              <Select
                label="Task Status"
                value={progressForm.status}
                onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value })}
              >
                {TASK_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {formatStatus(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Description" required fullWidth size="small" multiline rows={3} value={progressForm.description} onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })} sx={dialogFieldSx} />
            <TextField
              label="Progress (%)"
              type="number"
              fullWidth
              size="small"
              placeholder="Enter percentage"
              inputProps={{ min: 0, max: 100 }}
              value={progressForm.progress_percent}
              onChange={(e) =>
                setProgressForm({
                  ...progressForm,
                  progress_percent: sanitizeProgressInput(e.target.value),
                })
              }
              sx={{ ...dialogFieldSx, ...percentFieldSx }}
            />
            <TextField label="Date" type="date" required fullWidth size="small" InputLabelProps={{ shrink: true }} value={progressForm.date} onChange={(e) => setProgressForm({ ...progressForm, date: e.target.value })} sx={dialogFieldSx} />
            {selectedTaskForProgress &&
              taskNeedsProgressNote(
                selectedTaskForProgress,
                progressForm.status,
                parseProgressPercent(progressForm.progress_percent, selectedTaskForProgress.progress_percent ?? 0)
              ) && (
                <Typography variant="caption" color="text.secondary">
                  Updating status or progress from 0% will be saved together with this progress note.
                </Typography>
              )}
            <Button variant="outlined" component="label" sx={{ color: BRAND_BLUE, borderColor: BRAND_BLUE, textTransform: "none", alignSelf: "flex-start" }}>
              Attach Images
              <input type="file" hidden multiple accept="image/*" onChange={handleAddProgressImages} />
            </Button>
            {progressImagePreviews.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  {progressImagePreviews.length} image(s) selected — tap to preview
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(3, minmax(0, 1fr))",
                      sm: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}
                >
                  {progressImagePreviews.map((preview) => (
                    <Box
                      key={`${preview.name}-${preview.index}`}
                      sx={{
                        position: "relative",
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "2px solid rgba(26,95,180,0.15)",
                        bgcolor: "rgba(26,95,180,0.04)",
                        aspectRatio: "1",
                      }}
                    >
                      <Box
                        component="img"
                        src={preview.url}
                        alt={preview.name}
                        onClick={() => setPreview({ open: true, url: preview.url, fileName: preview.name })}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                          display: "block",
                          "&:hover": { opacity: 0.92 },
                        }}
                      />
                      <IconButton
                        size="small"
                        aria-label={`Remove ${preview.name}`}
                        onClick={() => handleRemoveProgressImage(preview.index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          width: 24,
                          height: 24,
                          "&:hover": { bgcolor: "rgba(198,40,40,0.9)" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeProgressDialog} disabled={progressSubmitting} sx={{ color: BRAND_BLUE }}>Cancel</Button>
          <Button onClick={handleProgressUpdateSubmit} variant="contained" disabled={progressSubmitting} sx={primaryButtonSx}>
            {progressSubmitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : progressDialogMode === "edit" ? (
              "Save Changes"
            ) : (
              "Save Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog
        open={openTaskViewDialog}
        onClose={() => {
          setOpenTaskViewDialog(false);
          setSelectedTaskForView(null);
        }}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ ...headerGradient, color: "white", fontWeight: 700, pr: 6 }}>
          Task Details
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, pb: 2 }}>
          {selectedTaskForView && (
            <TaskViewCard task={selectedTaskForView} onLogProgress={openProgressFromTaskView} />
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenTaskViewDialog(false);
              setSelectedTaskForView(null);
            }}
            sx={{ color: BRAND_BLUE }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectView;
