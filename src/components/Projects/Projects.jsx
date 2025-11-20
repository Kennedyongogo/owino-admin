import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Construction as ProjectIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineerIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Tabs, Tab, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const Projects = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProjects, setTotalProjects] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    planning: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0,
    cancelled: 0,
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    location_name: "",
    latitude: "",
    longitude: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget_estimate: 0,
    actual_cost: 0,
    currency: "KES",
    contractor_name: "",
    client_name: "",
    funding_source: "",
    engineer_in_charge: "",
    progress_percent: 0,
    blueprint_url: "",
    notes: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Project status tabs configuration
  const statusTabs = [
    { label: "All Projects", value: "all", count: tabCounts.all },
    { label: "Planning", value: "planning", count: tabCounts.planning },
    {
      label: "In Progress",
      value: "in_progress",
      count: tabCounts.in_progress,
    },
    { label: "Completed", value: "completed", count: tabCounts.completed },
    { label: "On Hold", value: "on_hold", count: tabCounts.on_hold },
    { label: "Cancelled", value: "cancelled", count: tabCounts.cancelled },
  ];

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, activeTab]);

  // Fetch all projects for tab counts on component mount
  useEffect(() => {
    fetchAllProjectsForCounts();
  }, []);

  // Check scroll buttons on mount and resize
  useEffect(() => {
    const checkButtons = () => {
      if (tabsContainerRef.current) {
        const container = tabsContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    checkButtons();
    const handleResize = () => {
      setTimeout(checkButtons, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [statusTabs]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      const currentStatus = statusTabs[activeTab]?.value;
      if (currentStatus && currentStatus !== "all") {
        queryParams.append("status", currentStatus);
      }

      const response = await fetch(`/api/projects?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.data || []);
        setTotalProjects(data.count || 0);

        // Don't update tab counts here - they should only be updated from fetchAllProjectsForCounts
        // to avoid incorrect counts when switching tabs
      } else {
        setError(
          "Failed to fetch projects: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching projects: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "planning":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "on_hold":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case "infrastructure":
        return "primary";
      case "residential":
        return "secondary";
      case "commercial":
        return "success";
      case "road_construction":
        return "warning";
      case "renovation":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Check scroll position and update button states
  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll left
  const scrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const updateTabCounts = (projectsData) => {
    const counts = {
      all: 0,
      planning: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0,
    };

    projectsData.forEach((project) => {
      counts.all++; // Count all projects
      if (counts.hasOwnProperty(project.status)) {
        counts[project.status]++;
      }
    });

    setTabCounts(counts);
  };

  const fetchAllProjectsForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/projects?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        updateTabCounts(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching project counts:", err);
    }
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type.includes("document")
    );

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/documents/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete file");
      }

      // Update project files list locally
      setProjectFiles((prev) => prev.filter((file) => file.id !== fileId));

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "File deleted successfully!",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete file. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    }
  };

  const handleDeleteProject = async (project) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${project.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        container: "swal-z-index-fix",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/projects/${project.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete project");
        }

        // Refresh projects list
        fetchProjects();
        fetchAllProjectsForCounts(); // Refresh tab counts

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Project has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } catch (err) {
        console.error("Error deleting project:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete project. Please try again.",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const projectData = {
        name: projectForm.name,
        description: projectForm.description,
        location_name: projectForm.location_name,
        latitude: projectForm.latitude,
        longitude: projectForm.longitude,
        status: projectForm.status,
        start_date: projectForm.start_date,
        end_date: projectForm.end_date,
        budget_estimate: projectForm.budget_estimate,
        actual_cost: projectForm.actual_cost,
        currency: projectForm.currency,
        contractor_name: projectForm.contractor_name,
        client_name: projectForm.client_name,
        funding_source: projectForm.funding_source,
        engineer_in_charge: projectForm.engineer_in_charge,
        progress_percent: projectForm.progress_percent,
        blueprint_url: projectForm.blueprint_url,
        notes: projectForm.notes,
      };

      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update project");
      }

      // Reset form and close dialog
      setProjectForm({
        name: "",
        description: "",
        location_name: "",
        latitude: "",
        longitude: "",
        status: "planning",
        start_date: "",
        end_date: "",
        budget_estimate: 0,
        actual_cost: 0,
        currency: "KES",
        contractor_name: "",
        client_name: "",
        funding_source: "",
        engineer_in_charge: "",
        progress_percent: 0,
        blueprint_url: "",
        notes: "",
      });
      setOpenEditDialog(false);
      setSelectedProject(null);

      // Refresh projects list
      fetchProjects();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Project has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating project:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update project. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #c3cfe2 100%)",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          border: "none",
          boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.05)",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: { xs: 2, sm: 4 },
            color: "white",
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              zIndex: 0,
            },
          }}
        >
          {/* Animated Background Elements */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              right: "20%",
              width: 100,
              height: 100,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 1.5, sm: 0 }}
            position="relative"
            zIndex={1}
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: { xs: "100%", sm: "auto" }, flex: { sm: 1 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  mb: { xs: 0.5, sm: 1 },
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  fontSize: { xs: "1.5rem", sm: "2.25rem", md: "2.5rem" },
                  wordBreak: "break-word",
                  color: "white",
                  letterSpacing: "-0.5px",
                }}
              >
                Projects Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.95,
                  fontSize: { xs: "0.875rem", sm: "1.125rem" },
                  wordBreak: "break-word",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 400,
                  textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                Create and manage construction projects
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/projects/create")}
              sx={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
                borderRadius: 4,
                px: { xs: 2, sm: 4 },
                py: { xs: 1.25, sm: 1.75 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 700,
                textTransform: "none",
                boxShadow:
                  "0 8px 25px rgba(255, 107, 107, 0.4), 0 4px 10px rgba(78, 205, 196, 0.3)",
                width: { xs: "100%", sm: "auto" },
                whiteSpace: "normal",
                flexShrink: 0,
                minWidth: { xs: "auto", sm: "auto" },
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  transition: "left 0.5s",
                },
                "&:hover::before": {
                  left: "100%",
                },
                "& .MuiButton-startIcon": {
                  marginRight: { xs: 0.75, sm: 1 },
                  marginLeft: 0,
                  transition: "transform 0.3s",
                },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #FF5252 0%, #26A69A 100%)",
                  transform: { xs: "none", sm: "translateY(-3px) scale(1.02)" },
                  boxShadow:
                    "0 12px 40px rgba(255, 107, 107, 0.5), 0 6px 15px rgba(78, 205, 196, 0.4)",
                  "& .MuiButton-startIcon": {
                    transform: "rotate(90deg)",
                  },
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Create New Project
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 4 },
            minHeight: "calc(100vh - 200px)",
            width: "100%",
            maxWidth: "100%",
            overflowX: "hidden",
            boxSizing: "border-box",
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.9) 100%)",
          }}
        >
          {/* Status Tabs */}
          <Box
            mb={{ xs: 2, sm: 3 }}
            sx={{
              width: "100%",
              maxWidth: "100%",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Left Arrow Button - Only visible on small screens */}
            {isSmallScreen && (
              <IconButton
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                sx={{
                  display: { xs: "flex", sm: "none" },
                  position: "absolute",
                  left: 4,
                  zIndex: 10,
                  backgroundColor: "#667eea",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    backgroundColor: "#5a6fd8",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(102, 126, 234, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}

            {/* Tabs Container */}
            <Box
              ref={tabsContainerRef}
              onScroll={checkScrollButtons}
              sx={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                pl: { xs: canScrollLeft ? 5 : 0, sm: 0 },
                pr: { xs: canScrollRight ? 5 : 0, sm: 0 },
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  borderRadius: 3,
                  px: 1,
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#667eea",
                    height: 4,
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "0 -2px 8px rgba(102, 126, 234, 0.4)",
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.95rem" },
                    minHeight: { xs: 44, sm: 52 },
                    color: "#666",
                    px: { xs: 1.5, sm: 2.5 },
                    py: 1.5,
                    minWidth: { xs: "auto", sm: 120 },
                    borderRadius: 2,
                    mx: 0.5,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&.Mui-selected": {
                      color: "#667eea",
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      fontWeight: 700,
                    },
                    "&:hover": {
                      color: "#667eea",
                      backgroundColor: "rgba(102, 126, 234, 0.08)",
                      transform: "translateY(-2px)",
                    },
                  },
                }}
              >
                {statusTabs.map((tab, index) => (
                  <Tab
                    key={tab.value}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{tab.label}</span>
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            backgroundColor:
                              activeTab === index
                                ? "rgba(255, 255, 255, 0.3)"
                                : "rgba(102, 126, 234, 0.15)",
                            color: activeTab === index ? "white" : "#667eea",
                            fontWeight: 700,
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            height: { xs: 20, sm: 24 },
                            minWidth: { xs: 20, sm: 24 },
                            borderRadius: 2,
                            boxShadow:
                              activeTab === index
                                ? "0 2px 6px rgba(255, 255, 255, 0.3)"
                                : "0 1px 3px rgba(102, 126, 234, 0.2)",
                            transition: "all 0.3s ease",
                          }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Right Arrow Button - Only visible on small screens */}
            {isSmallScreen && (
              <IconButton
                onClick={scrollRight}
                disabled={!canScrollRight}
                sx={{
                  display: { xs: "flex", sm: "none" },
                  position: "absolute",
                  right: 4,
                  zIndex: 10,
                  backgroundColor: "#667eea",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    backgroundColor: "#5a6fd8",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(102, 126, 234, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </Box>
          {/* Projects Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: { xs: 3, sm: 4 },
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(102, 126, 234, 0.15)",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              boxShadow:
                "0 8px 32px rgba(102, 126, 234, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(10px)",
              "&::-webkit-scrollbar": {
                height: { xs: 6, sm: 8 },
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(102, 126, 234, 0.05)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(102, 126, 234, 0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.5)",
                },
              },
            }}
          >
            <Table
              sx={{
                minWidth: { xs: 300, sm: 800 },
                width: "100%",
                tableLayout: { xs: "auto", sm: "fixed" },
              }}
            >
              {/* Set minimum width for table */}
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 800,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      border: "none",
                      whiteSpace: "nowrap",
                      py: { xs: 1.5, sm: 2 },
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Category
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSmallScreen ? 3 : 5}
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <CircularProgress
                          sx={{ color: "#667eea" }}
                          size={48}
                          thickness={4}
                        />
                        <Typography
                          variant="body1"
                          sx={{ color: "#667eea", fontWeight: 600 }}
                        >
                          Loading projects...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSmallScreen ? 3 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Alert
                          severity="error"
                          sx={{
                            width: "100%",
                            maxWidth: 500,
                            borderRadius: 3,
                            boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {error}
                          </Typography>
                        </Alert>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSmallScreen ? 3 : 5}
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1,
                          }}
                        >
                          <ProjectIcon
                            sx={{
                              fontSize: 40,
                              color: "#667eea",
                              opacity: 0.6,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#2c3e50",
                            fontWeight: 700,
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          No projects found
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#7f8c8d",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                            maxWidth: 400,
                            textAlign: "center",
                          }}
                        >
                          Get started by creating your first project
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => navigate("/projects/create")}
                          sx={{
                            mt: 1,
                            background:
                              "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: "none",
                            boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #FF5252 0%, #26A69A 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Create New Project
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project, idx) => (
                    <TableRow
                      key={project.id}
                      sx={{
                        borderLeft: "4px solid transparent",
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(102, 126, 234, 0.03)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          borderLeft: "4px solid #667eea",
                          transform: { xs: "none", sm: "translateX(4px)" },
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          padding: { xs: "12px 8px", sm: "18px 16px" },
                          borderBottom: "1px solid rgba(102, 126, 234, 0.08)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#667eea",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            borderRadius: "50%",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                            color: "#667eea",
                            fontWeight: 700,
                          }}
                        >
                          {page * rowsPerPage + idx + 1}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: { xs: 150, sm: "none" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          sx={{
                            color: "#2c3e50",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: { xs: "nowrap", sm: "normal" },
                            maxWidth: { xs: 150, sm: "100%" },
                            fontSize: { xs: "0.875rem", sm: "0.95rem" },
                            "&:hover": {
                              color: "#667eea",
                            },
                            transition: "color 0.2s ease",
                          }}
                        >
                          {project.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 700,
                            borderRadius: 3,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            height: { xs: 24, sm: 28 },
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        {project.category ? (
                          <Chip
                            label={project.category
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                              color: "#667eea",
                              fontWeight: 600,
                              borderRadius: 2,
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              height: { xs: 24, sm: 28 },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#999", fontStyle: "italic" }}
                          >
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={{ xs: 0.5, sm: 1 }}>
                          <Tooltip
                            title="View Project Details"
                            arrow
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleViewProject(project)}
                              sx={{
                                color: "#27ae60",
                                backgroundColor: "rgba(39, 174, 96, 0.12)",
                                padding: { xs: 0.75, sm: 1 },
                                boxShadow: "0 2px 8px rgba(39, 174, 96, 0.2)",
                                "&:hover": {
                                  backgroundColor: "#27ae60",
                                  color: "white",
                                  transform: {
                                    xs: "none",
                                    sm: "scale(1.15) translateY(-2px)",
                                  },
                                  boxShadow:
                                    "0 4px 12px rgba(39, 174, 96, 0.4)",
                                },
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                borderRadius: 2.5,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Project" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProject(project)}
                              sx={{
                                color: "#3498db",
                                backgroundColor: "rgba(52, 152, 219, 0.12)",
                                padding: { xs: 0.75, sm: 1 },
                                boxShadow: "0 2px 8px rgba(52, 152, 219, 0.2)",
                                "&:hover": {
                                  backgroundColor: "#3498db",
                                  color: "white",
                                  transform: {
                                    xs: "none",
                                    sm: "scale(1.15) translateY(-2px)",
                                  },
                                  boxShadow:
                                    "0 4px 12px rgba(52, 152, 219, 0.4)",
                                },
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                borderRadius: 2.5,
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Project" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProject(project)}
                              sx={{
                                color: "#e74c3c",
                                backgroundColor: "rgba(231, 76, 60, 0.12)",
                                padding: { xs: 0.75, sm: 1 },
                                boxShadow: "0 2px 8px rgba(231, 76, 60, 0.2)",
                                "&:hover": {
                                  backgroundColor: "#e74c3c",
                                  color: "white",
                                  transform: {
                                    xs: "none",
                                    sm: "scale(1.15) translateY(-2px)",
                                  },
                                  boxShadow:
                                    "0 4px 12px rgba(231, 76, 60, 0.4)",
                                },
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                borderRadius: 2.5,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalProjects}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={isSmallScreen ? "Rows:" : "Rows per page:"}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderTop: "1px solid rgba(102, 126, 234, 0.15)",
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 -2px 8px rgba(102, 126, 234, 0.08)",
              "& .MuiTablePagination-toolbar": {
                color: "#667eea",
                fontWeight: 600,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                px: { xs: 1.5, sm: 2.5 },
                py: 1,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#2c3e50",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  mr: { xs: 1.5, sm: 2.5 },
                },
              "& .MuiTablePagination-select": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                },
              },
              "& .MuiTablePagination-actions": {
                ml: { xs: 1, sm: 2.5 },
                "& .MuiIconButton-root": {
                  color: "#667eea",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                },
              },
            }}
          />
        </Box>

        {/* Project Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setSelectedProject(null);
            setProjectForm({
              name: "",
              description: "",
              location_name: "",
              latitude: "",
              longitude: "",
              status: "planning",
              start_date: "",
              end_date: "",
              budget_estimate: 0,
              actual_cost: 0,
              currency: "KES",
              contractor_name: "",
              client_name: "",
              funding_source: "",
              engineer_in_charge: "",
              progress_percent: 0,
              blueprint_url: "",
              notes: "",
            });
            setSelectedFiles([]);
            setProjectFiles([]);
          }}
          maxWidth="xs"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "85vh",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 80,
                height: 80,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <ProjectIcon
              sx={{ position: "relative", zIndex: 1, fontSize: 28 }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  color: "#000",
                }}
              >
                {openViewDialog ? "Project Details" : "Create New Project"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.5, color: "#000" }}
              >
                {openViewDialog
                  ? "View project information"
                  : "Add a new project to the system"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View Event Details - Enhanced UI
              <Box>
                {/* Event Header Section */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    mt: 2,
                    position: "relative",
                    overflow: "hidden",
                    color: "white",
                  }}
                >
                  {/* Decorative Elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "50%",
                      zIndex: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -15,
                      left: -15,
                      width: 80,
                      height: 80,
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "50%",
                      zIndex: 0,
                    }}
                  />

                  {/* Content */}
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        background: "linear-gradient(45deg, #fff, #f0f8ff)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {selectedEvent.eventTitle}
                    </Typography>

                    {selectedEvent.description && (
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                          fontSize: "1rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {selectedEvent.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Event Details Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Venue Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(255, 107, 107, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Venue
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.venue}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Date Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(78, 205, 196, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(78, 205, 196, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Event Date
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {formatDate(selectedEvent.eventDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Time Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(254, 202, 87, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(254, 202, 87, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TimeIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Time
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.startTime || "TBD"} -{" "}
                            {selectedEvent.endTime || "TBD"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Attendance Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)",
                        color: "#2c3e50",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(168, 230, 207, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(168, 230, 207, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(44, 62, 80, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 24, color: "#2c3e50" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Expected Attendance
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {selectedEvent.expectedAttendance || 0} people
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Status Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #ffd93d 0%, #6bcf7f 100%)",
                        color: "#2c3e50",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(255, 217, 61, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(255, 217, 61, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(44, 62, 80, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EventIcon sx={{ fontSize: 24, color: "#2c3e50" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Status
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedEvent.status}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Type Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #c44569 0%, #f8b500 100%)",
                        color: "white",
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        boxShadow: "0 8px 25px rgba(196, 69, 105, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 35px rgba(196, 69, 105, 0.4)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EventIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.8,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Event Type
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedEvent.eventType}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Information Section */}
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#667eea",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EventIcon />
                    Additional Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Public Event
                        </Typography>
                        <Chip
                          label={selectedEvent.isPublic ? "Public" : "Private"}
                          color={selectedEvent.isPublic ? "success" : "default"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Actual Attendance
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: selectedEvent.actualAttendance
                              ? "#27ae60"
                              : "#7f8c8d",
                          }}
                        >
                          {selectedEvent.actualAttendance || "Not recorded"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Created By
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#000" }}
                        >
                          {selectedEvent.creator?.name || "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{
                            mb: 0.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Created At
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedEvent.createdAt
                            ? new Date(selectedEvent.createdAt).toLocaleString()
                            : "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Invites Section */}
                {selectedEvent.invites && selectedEvent.invites.length > 0 && (
                  <Box
                    sx={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PeopleIcon />
                      Invited Contacts ({selectedEvent.invites.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedEvent.invites.map((invite, index) => (
                        <Chip
                          key={index}
                          label={invite}
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontWeight: 600,
                            borderRadius: 2,
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Event Images Section */}
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <Box
                    sx={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ImageIcon />
                      Event Images ({selectedEvent.images.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {selectedEvent.images.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 140,
                            height: 140,
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "3px solid #e0e0e0",
                            cursor: "pointer",
                            position: "relative",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                              border: "3px solid #667eea",
                              transform: "scale(1.05)",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          <img
                            src={`/api/${image}`}
                            alt={`Event ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "rgba(0,0,0,0.8)",
                              color: "white",
                              borderRadius: "50%",
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              border: "2px solid white",
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              // Create New Event Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {/* Event Title */}
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={projectForm.name}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        name: e.target.value,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />

                  {/* Location */}
                  <TextField
                    fullWidth
                    label="Location"
                    value={projectForm.location_name}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        location_name: e.target.value,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />

                  {/* Start Date and End Date Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          start_date: e.target.value,
                        })
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          end_date: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Budget and Currency Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Budget Estimate"
                      type="number"
                      value={projectForm.budget_estimate}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          budget_estimate: parseFloat(e.target.value) || 0,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={projectForm.currency}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            currency: e.target.value,
                          })
                        }
                        label="Currency"
                      >
                        <MenuItem value="KES">KES</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Contractor and Client Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Contractor Name"
                      value={projectForm.contractor_name}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          contractor_name: e.target.value,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={projectForm.client_name}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          client_name: e.target.value,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Status */}
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          status: e.target.value,
                        })
                      }
                      label="Status"
                    >
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenEditDialog(false);
                setOpenCreateDialog(false);
                setSelectedEvent(null);
                setEventForm({
                  eventTitle: "",
                  venue: "",
                  description: "",
                  eventDate: "",
                  startTime: "",
                  endTime: "",
                  eventType: "meeting",
                  status: "planned",
                  expectedAttendance: 0,
                  actualAttendance: null,
                  isPublic: false,
                  invites: "",
                });
                setSelectedImages([]);
                setEventImages([]);
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#5a6fd8",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Projects;
