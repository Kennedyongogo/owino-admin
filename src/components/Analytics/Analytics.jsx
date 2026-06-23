import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Construction,
  ContactMail,
  ElectricalServices,
  RateReview,
  Refresh,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BRAND_BLUE,
  BRAND_BLUE_DARK,
  BRAND_GOLD,
  cardSx,
  headerGradient,
  pageBackground,
  primaryButtonSx,
} from "../Projects/projectTheme";

const CHART_COLORS = [
  BRAND_BLUE,
  BRAND_GOLD,
  BRAND_BLUE_DARK,
  "#2e7d32",
  "#c62828",
  "#9a7b00",
  "#7b1fa2",
  "#00838f",
];

const STATUS_COLORS = {
  planning: BRAND_BLUE,
  in_progress: BRAND_GOLD,
  completed: "#2e7d32",
  on_hold: "#757575",
  cancelled: "#c62828",
  pending: BRAND_GOLD,
  approved: "#2e7d32",
  rejected: "#c62828",
  open: BRAND_BLUE,
  in_review: "#9a7b00",
  resolved: "#2e7d32",
  active: "#2e7d32",
  inactive: "#757575",
};

const SUMMARY_CARDS = [
  {
    key: "projects",
    label: "Projects",
    path: "/projects",
    icon: Construction,
    gradient: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
  },
  {
    key: "reviews",
    label: "Reviews",
    path: "/reviews",
    icon: RateReview,
    gradient: "linear-gradient(135deg, #2e7d32, #1b5e20)",
  },
  {
    key: "inquiries",
    label: "Inquiries",
    path: "/inquiries",
    icon: ContactMail,
    gradient: "linear-gradient(135deg, #9a7b00, #f57f17)",
  },
  {
    key: "services",
    label: "Services",
    path: "/services",
    icon: ElectricalServices,
    gradient: "linear-gradient(135deg, #00838f, #006064)",
  },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <Paper
      elevation={4}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: `1px solid rgba(26, 95, 180, 0.2)`,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        {label || item?.name}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND_BLUE }}>
        {item?.value ?? item?.payload?.value ?? 0}
      </Typography>
    </Paper>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <Paper
      elevation={4}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: `1px solid rgba(26, 95, 180, 0.2)`,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND_BLUE }}>
        {item?.name}: {item?.value}
      </Typography>
    </Paper>
  );
};

const getSliceColor = (entry, index) =>
  STATUS_COLORS[entry?.key] || CHART_COLORS[index % CHART_COLORS.length];

const StatusLegend = ({ items }) => (
  <Stack
    direction="row"
    flexWrap="wrap"
    useFlexGap
    spacing={1}
    justifyContent="center"
    sx={{ mt: 1.5, px: 0.5, rowGap: 1 }}
  >
    {items.map((item, index) => (
      <Stack key={item.key} direction="row" alignItems="center" spacing={0.75}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: getSliceColor(item, index),
            opacity: item.value > 0 ? 1 : 0.4,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: item.value > 0 ? "#444" : "#888",
            whiteSpace: "nowrap",
          }}
        >
          {item.name} ({item.value})
        </Typography>
      </Stack>
    ))}
  </Stack>
);

const BreakdownPie = ({ title, data = [], height = 260 }) => {
  const allStatuses = data;
  const pieSlices = allStatuses.filter((d) => d.value > 0);
  const hasSlices = pieSlices.length > 0;

  return (
    <Paper sx={{ ...cardSx, p: { xs: 2, sm: 2.5 }, height: "100%" }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: BRAND_BLUE, mb: 1.5, fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
      >
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          {hasSlices ? (
            <Pie
              data={pieSlices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius="42%"
              outerRadius="68%"
              paddingAngle={2}
            >
              {pieSlices.map((entry, index) => (
                <Cell key={`${entry.key || entry.name}-${index}`} fill={getSliceColor(entry, index)} />
              ))}
            </Pie>
          ) : (
            <Pie
              data={[{ name: "empty", value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="45%"
              innerRadius="42%"
              outerRadius="68%"
              fill="rgba(26, 95, 180, 0.08)"
              stroke="rgba(26, 95, 180, 0.15)"
              isAnimationActive={false}
            />
          )}
          <RechartsTooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <StatusLegend items={allStatuses} />
    </Paper>
  );
};

export default function Analytics() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breakdownHeight = isMobile ? 200 : 220;

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in again.");
        return;
      }

      const response = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load dashboard stats");
      }

      setStats(data.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Box sx={{ ...pageBackground, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: BRAND_BLUE }} />
          <Typography color="text.secondary">Loading dashboard…</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ...pageBackground, p: { xs: 2, md: 3 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ ...pageBackground, pb: { xs: 3, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          ...headerGradient,
          borderRadius: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, md: 3 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <TrendingUp sx={{ color: BRAND_GOLD }} />
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", letterSpacing: 1.2 }}>
                SafeWire Admin
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2rem" } }}>
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)", mt: 0.5, maxWidth: 520 }}>
              Overview of projects, reviews, inquiries, and services at a glance.
            </Typography>
          </Box>
          <Tooltip title="Refresh stats">
            <IconButton
              onClick={fetchStats}
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                alignSelf: { xs: "flex-end", sm: "center" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mb: { xs: 2, md: 3 } }}>
          {SUMMARY_CARDS.map((card) => {
            const Icon = card.icon;
            const value = stats?.totals?.[card.key] ?? 0;
            return (
              <Grid key={card.key} size={{ xs: 6, sm: 6, md: 3 }}>
                <Paper
                  onClick={() => navigate(card.path)}
                  sx={{
                    ...cardSx,
                    p: { xs: 1.75, sm: 2.25 },
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 36px rgba(26, 95, 180, 0.18)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: { xs: 44, sm: 52 },
                        height: { xs: 44, sm: 52 },
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: card.gradient,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: { xs: 22, sm: 26 } }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: BRAND_BLUE, lineHeight: 1.1, fontSize: { xs: "1.6rem", sm: "2rem" } }}
                      >
                        {value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.78rem", sm: "0.875rem" } }}>
                        {card.label}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: BRAND_BLUE, mb: { xs: 1.5, md: 2 }, fontSize: { xs: "1rem", sm: "1.15rem" } }}
        >
          Status breakdown
        </Typography>

        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mb: { xs: 2, md: 3 } }}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <BreakdownPie
              title="Projects by status"
              data={stats?.projects?.byStatus}
              height={breakdownHeight}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <BreakdownPie
              title="Reviews by status"
              data={stats?.reviews?.byStatus}
              height={breakdownHeight}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <BreakdownPie
              title="Inquiries by status"
              data={stats?.inquiries?.byStatus}
              height={breakdownHeight}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <BreakdownPie
              title="Services availability"
              data={stats?.services?.byStatus}
              height={breakdownHeight}
            />
          </Grid>
        </Grid>

        {stats?.reviews?.averageRating > 0 && (
          <Paper sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_BLUE }}>
                  Review ratings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average rating: <strong>{stats.reviews.averageRating}</strong> / 5
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate("/reviews")} sx={primaryButtonSx}>
                Manage reviews
              </Button>
            </Stack>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
              <BarChart data={stats.reviews.byRating} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,95,180,0.12)" />
                <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#555", fontSize: 12 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill={BRAND_GOLD} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
