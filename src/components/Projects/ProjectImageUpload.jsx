import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { PhotoCamera as UploadIcon } from "@mui/icons-material";
import { BRAND_BLUE, BRAND_BLUE_DARK, BRAND_GOLD } from "./projectTheme";

export default function ProjectImageUpload({ preview, onFile, onInvalidFile }) {
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onInvalidFile?.();
      return;
    }
    onFile(file);
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      sx={{
        width: "100%",
        border: `2px dashed rgba(26,95,180,0.35)`,
        borderRadius: 2.5,
        p: 2,
        textAlign: "center",
        cursor: "pointer",
        bgcolor: "rgba(26,95,180,0.03)",
        transition: "all 0.2s",
        "&:hover": { borderColor: BRAND_BLUE, bgcolor: "rgba(26,95,180,0.06)" },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt="Project preview"
          sx={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 2,
            mb: 1,
            border: `3px solid ${BRAND_GOLD}`,
            boxShadow: "0 8px 24px rgba(26,95,180,0.15)",
          }}
        />
      ) : (
        <UploadIcon sx={{ fontSize: 42, color: BRAND_BLUE, opacity: 0.55, mb: 0.5 }} />
      )}
      <Typography fontWeight={700} color={BRAND_BLUE_DARK}>
        {preview ? "Tap to change project photo" : "Upload project photo"}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Shown on the public site and project details — JPG, PNG, or GIF up to 10MB
      </Typography>
    </Box>
  );
}
