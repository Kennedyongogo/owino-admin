export const BRAND_BLUE = "#1a5fb4";
export const BRAND_BLUE_DARK = "#134a8c";
export const BRAND_GOLD = "#f5c518";

export const pageBackground = {
  minHeight: "100vh",
  background: "linear-gradient(160deg, #f0f6ff 0%, #fffef5 50%, #f5f9ff 100%)",
};

export const headerGradient = {
  background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
  color: "white",
  borderBottom: `3px solid ${BRAND_GOLD}`,
};

export const cardSx = {
  backgroundColor: "#ffffff",
  borderRadius: 3,
  border: `1px solid rgba(26, 95, 180, 0.12)`,
  boxShadow: "0 8px 32px rgba(26, 95, 180, 0.1)",
  overflow: "hidden",
};

export const sectionTitleSx = {
  color: BRAND_BLUE,
  fontWeight: 700,
  fontSize: { xs: "1.15rem", sm: "1.35rem" },
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": { borderColor: "rgba(26, 95, 180, 0.22)" },
    "&:hover fieldset": { borderColor: BRAND_BLUE },
    "&.Mui-focused fieldset": { borderColor: BRAND_BLUE, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND_BLUE },
};

export const primaryButtonSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
  border: `1px solid rgba(245, 197, 24, 0.35)`,
  boxShadow: `0 4px 16px rgba(26, 95, 180, 0.35)`,
  "&:hover": {
    background: `linear-gradient(135deg, ${BRAND_BLUE_DARK}, ${BRAND_BLUE})`,
    boxShadow: `0 6px 20px rgba(26, 95, 180, 0.45)`,
  },
};

export const statusColors = {
  planning: { bg: "rgba(26, 95, 180, 0.12)", color: BRAND_BLUE },
  in_progress: { bg: "rgba(245, 197, 24, 0.2)", color: "#9a7b00" },
  completed: { bg: "rgba(46, 125, 50, 0.12)", color: "#2e7d32" },
  on_hold: { bg: "rgba(0, 0, 0, 0.08)", color: "#555" },
  cancelled: { bg: "rgba(211, 47, 47, 0.12)", color: "#c62828" },
};

export const formatStatus = (status) =>
  (status || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
