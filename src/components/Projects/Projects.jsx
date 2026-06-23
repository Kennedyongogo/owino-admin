import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Construction as ProjectIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import Swal from "sweetalert2";
import {
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  pageBackground,
  headerGradient,
  primaryButtonSx,
  statusColors,
  formatStatus,
} from "./projectTheme";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
];

const Projects = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, activeTab, isSmallScreen]);

  useEffect(() => {
    fetchAllProjectsForCounts();
  }, []);

  useEffect(() => {
    const check = () => {
      if (!tabsContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [tabCounts]);

  const fetchProjects = async () => {
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
      const status = STATUS_TABS[activeTab]?.value;
      if (!isSmallScreen && status && status !== "all") params.append("status", status);

      const response = await fetch(`/api/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data || []);
        setTotalProjects(data.count || 0);
      } else {
        setError(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjectsForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("/api/projects?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const counts = {
          all: 0,
          planning: 0,
          in_progress: 0,
          completed: 0,
          on_hold: 0,
          cancelled: 0,
        };
        (data.data || []).forEach((p) => {
          counts.all++;
          if (counts[p.status] !== undefined) counts[p.status]++;
        });
        setTabCounts(counts);
      }
    } catch {
      /* ignore */
    }
  };

  const handleDeleteProject = async (project) => {
    const result = await Swal.fire({
      title: "Delete project?",
      text: `"${project.name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: BRAND_BLUE,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Delete failed");
      fetchProjects();
      fetchAllProjectsForCounts();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Failed to delete project" });
    }
  };

  const StatusChip = ({ status }) => {
    const colors = statusColors[status] || statusColors.on_hold;
    return (
      <Chip
        label={formatStatus(status)}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.72rem",
          backgroundColor: colors.bg,
          color: colors.color,
          border: `1px solid ${colors.color}33`,
        }}
      />
    );
  };

  const renderProjectActions = (project) => (
    <Box display="flex" justifyContent="flex-end" gap={0.25} flexShrink={0}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => navigate(`/projects/${project.id}`)}
          sx={{ color: BRAND_BLUE, bgcolor: "rgba(26,95,180,0.08)", p: { xs: 0.5, sm: 0.75 } }}
        >
          <ViewIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => navigate(`/projects/${project.id}/edit`)}
          sx={{ color: BRAND_GOLD, bgcolor: "rgba(245,197,24,0.15)", p: { xs: 0.5, sm: 0.75 } }}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => handleDeleteProject(project)}
          sx={{ color: "#c62828", bgcolor: "rgba(198,40,40,0.08)", p: { xs: 0.5, sm: 0.75 } }}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const emptyState = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      width="100%"
      py={6}
      px={2}
    >
      <ProjectIcon sx={{ fontSize: 48, color: BRAND_BLUE, opacity: 0.4, mb: 1 }} />
      <Typography fontWeight={600} color="text.secondary">
        No projects found
      </Typography>
      <Button
        sx={{ mt: 2, ...primaryButtonSx, alignSelf: "center" }}
        startIcon={<AddIcon />}
        onClick={() => navigate("/projects/create")}
      >
        Create Project
      </Button>
    </Box>
  );

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

  const colSpan = isSmallScreen ? 3 : 4;

  if (error && !loading && projects.length === 0) {
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
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" } }}
              >
                Projects
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: "0.85rem", md: "1rem" } }}>
                Manage electrical projects across SafeWire Electricals
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/projects/create")}
              sx={{ ...primaryButtonSx, width: { xs: "100%", sm: "auto" } }}
            >
              New Project
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 1, sm: 1.5, md: 4 }, py: { xs: 2, md: 3 }, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          {!isSmallScreen && (
          <Box sx={{ position: "relative", mb: 2.5 }}>
            <IconButton
              onClick={() => tabsContainerRef.current?.scrollBy({ left: -180, behavior: "smooth" })}
              disabled={!canScrollLeft}
              sx={{
                position: "absolute",
                left: 0,
                zIndex: 2,
                bgcolor: BRAND_BLUE,
                color: "#fff",
                width: 32,
                height: 32,
                display: { xs: "flex", sm: "none" },
                "&:disabled": { bgcolor: "rgba(26,95,180,0.3)" },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Box
              ref={tabsContainerRef}
              onScroll={() => {
                if (!tabsContainerRef.current) return;
                const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
                setCanScrollLeft(scrollLeft > 0);
                setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
              }}
              sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => {
                  setActiveTab(v);
                  setPage(0);
                }}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                  minHeight: 44,
                  "& .MuiTabs-indicator": { backgroundColor: BRAND_GOLD, height: 3 },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 44,
                    color: "rgba(26,95,180,0.65)",
                    "&.Mui-selected": { color: BRAND_BLUE },
                  },
                }}
              >
                {STATUS_TABS.map((tab, i) => (
                  <Tab
                    key={tab.value}
                    label={
                      <Box display="flex" alignItems="center" gap={0.75}>
                        {tab.label}
                        <Chip
                          label={tabCounts[tab.value]}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            bgcolor: activeTab === i ? "rgba(245,197,24,0.25)" : "rgba(26,95,180,0.1)",
                            color: activeTab === i ? BRAND_BLUE_DARK : BRAND_BLUE,
                          }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>
            <IconButton
              onClick={() => tabsContainerRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
              disabled={!canScrollRight}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                zIndex: 2,
                bgcolor: BRAND_BLUE,
                color: "#fff",
                width: 32,
                height: 32,
                display: { xs: "flex", sm: "none" },
                "&:disabled": { bgcolor: "rgba(26,95,180,0.3)" },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          )}

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
                  <TableCell sx={{ width: { xs: 36, sm: 56 }, minWidth: { xs: 36, sm: 56 } }}>No</TableCell>
                  <TableCell sx={{ minWidth: 0 }}>Project</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, width: 120 }}>Status</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: { xs: 112, sm: 130 },
                      minWidth: { xs: 112, sm: 130 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: BRAND_BLUE, display: "block", mx: "auto" }} />
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} sx={{ py: 0, border: 0 }}>
                      {emptyState}
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project, idx) => (
                    <TableRow
                      key={project.id}
                      hover
                      sx={{
                        cursor: isSmallScreen ? "default" : "pointer",
                        borderLeft: "3px solid transparent",
                        "&:hover": {
                          bgcolor: "rgba(26,95,180,0.04)",
                          borderLeftColor: BRAND_GOLD,
                        },
                      }}
                      onClick={isSmallScreen ? undefined : () => navigate(`/projects/${project.id}`)}
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
                          {project.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <StatusChip status={project.status} />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: "nowrap", p: { xs: 0.5, sm: 1.5 } }}>
                        {renderProjectActions(project)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalProjects}
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
    </Box>
  );
};

export default Projects;
