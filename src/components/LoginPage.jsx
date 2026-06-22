import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  Grid,
  Container,
  Stack,
  Divider,
  Fade,
  Slide,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const BRAND_BLUE = "#1a5fb4";
const BRAND_BLUE_DARK = "#134a8c";
const BRAND_GOLD = "#f5c518";

const images = [
  "/652234-electricity-1998106_1920.jpg",
  "/akela999-electrical-2476782_1920.jpg",
  "/jarmoluk-electric-1080584_1920.jpg",
  "/martinelle-automation-5393191_1920.jpg",
  "/superadsmaker-panel-6816102_1920.jpg",
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: 2,
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "& fieldset": {
      borderColor: "rgba(26, 95, 180, 0.22)",
    },
    "&:hover fieldset": {
      borderColor: BRAND_BLUE,
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px rgba(245, 197, 24, 0.28)`,
    },
    "&.Mui-focused fieldset": {
      borderColor: BRAND_BLUE,
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(26, 95, 180, 0.65)",
    "&.Mui-focused": {
      color: BRAND_BLUE,
    },
  },
  "& .MuiInputBase-input": {
    color: "#1a1a2e",
    fontSize: { xs: "0.9rem", sm: "1rem" },
  },
};

export default function LoginPage() {
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({ email: null });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();

    const d = body;
    d.email = rfEmail.current.value.toLowerCase().trim();
    d.password = rfPassword.current.value;
    updateBody(d);

    if (!validateEmail(body.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND_BLUE,
      });
      return;
    }

    if (!validatePassword(body.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: BRAND_BLUE,
      });
      return;
    }

    if (validateEmail(body.email) && validatePassword(body.password)) {
      setLoading(true);
      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch("/api/admins/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: data.message,
            confirmButtonColor: BRAND_BLUE,
          });
        } else if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: data.message,
            timer: 1500,
            showConfirmButton: false,
          });
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("userRole", data.data.admin.role);
          localStorage.setItem("user", JSON.stringify(data.data.admin));
          setTimeout(() => {
            navigate("/analytics");
          }, 1500);
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: data.message,
            confirmButtonColor: BRAND_BLUE,
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Login failed. Please try again.",
          confirmButtonColor: BRAND_BLUE,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = async () => {
    const d = { Email: rsEmail.current.value.toLowerCase().trim() };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: BRAND_BLUE,
      });
      return;
    }

    setResetLoading(true);
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/api/admins/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();

      if (response.ok) {
        setOpenResetDialog(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          confirmButtonColor: BRAND_BLUE,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: BRAND_BLUE,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: BRAND_BLUE,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  useEffect(() => {
    let currentIndex = 0;
    const backgroundElement = document.querySelector(".login-background");

    images.forEach((imageSrc) => {
      const img = new Image();
      img.src = encodeURI(imageSrc);
    });

    const changeBackground = () => {
      if (backgroundElement) {
        backgroundElement.style.opacity = 0;
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % images.length;
          backgroundElement.style.backgroundImage = `url(${encodeURI(
            images[currentIndex]
          )})`;
          backgroundElement.style.opacity = 1;
        }, 500);
      }
    };

    if (backgroundElement) {
      backgroundElement.style.transition = "opacity 1s ease-in-out";
      backgroundElement.style.opacity = 1;
    }

    const intervalId = setInterval(changeBackground, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const BrandTitle = ({ centered = false }) => (
    <Typography
      variant="h2"
      sx={{
        fontWeight: 700,
        fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.75rem" },
        textAlign: centered ? "center" : { xs: "center", md: "left" },
        whiteSpace: "nowrap",
        textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
        lineHeight: 1.2,
      }}
    >
      <Box component="span" sx={{ color: BRAND_BLUE }}>
        SafeWire
      </Box>{" "}
      <Box component="span" sx={{ color: BRAND_GOLD }}>
        Electrical
      </Box>
    </Typography>
  );

  const TaglineBadge = ({ centered = false }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: { xs: 1, sm: 1.5, md: 2 },
        py: { xs: 0.35, sm: 0.5, md: 0.75 },
        borderRadius: "20px",
        backgroundColor: BRAND_BLUE,
        border: `1.5px solid ${BRAND_GOLD}`,
        boxShadow: `0 4px 12px rgba(26, 95, 180, 0.35)`,
        mx: centered ? "auto" : undefined,
      }}
    >
      <Typography
        sx={{
          fontSize: "clamp(0.6rem, 2.2vw, 0.95rem)",
          fontWeight: 600,
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
          color: BRAND_GOLD,
          textShadow: "1px 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        Certified power, wiring & solar experts
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        className="login-background"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${encodeURI(images[0])})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1a1a1a",
          transition: "opacity 1s ease-in-out",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.28) 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 },
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ height: "100%", display: "flex", alignItems: "center" }}
        >
          <Grid
            container
            spacing={{ xs: 1.5, md: 4 }}
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Fade in timeout={800}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { md: 2, lg: 3 },
                  }}
                >
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="SafeWire Electrical"
                    sx={{
                      height: { md: 88, lg: 100 },
                      width: "auto",
                      flexShrink: 0,
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
                    }}
                  />
                  <Stack spacing={1.5} alignItems="flex-start">
                    <BrandTitle />
                    <TaglineBadge />
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Slide direction="up" in timeout={600}>
                <Card
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: { xs: 3, sm: 4 },
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.98)",
                    border: `1px solid rgba(26, 95, 180, 0.12)`,
                    borderTop: `4px solid ${BRAND_GOLD}`,
                    boxShadow:
                      "0 24px 64px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255,255,255,0.5)",
                  }}
                >
                  <Box
                    sx={{
                      height: 4,
                      background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_GOLD}, ${BRAND_BLUE})`,
                    }}
                  />

                  <Box sx={{ p: { xs: 1.5, sm: 3, md: 3.5 } }}>
                    <Stack
                      spacing={{ xs: 0.75, sm: 1.5 }}
                      alignItems="center"
                      sx={{ mb: { xs: 1.25, sm: 2.5 } }}
                    >
                      <Box
                        component="img"
                        src="/logo.png"
                        alt="SafeWire Electrical"
                        sx={{
                          height: { xs: 44, sm: 64 },
                          width: "auto",
                          display: { xs: "block", md: "none" },
                          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
                        }}
                      />

                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: BRAND_BLUE,
                            fontSize: { xs: "1.15rem", sm: "1.4rem" },
                            letterSpacing: "0.02em",
                          }}
                        >
                          Admin Sign In
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(26, 95, 180, 0.65)",
                            mt: 0.25,
                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                          }}
                        >
                          Secure access to your dashboard
                        </Typography>
                      </Box>
                    </Stack>

                    <form onSubmit={login}>
                      <Stack spacing={{ xs: 1.25, sm: 1.75 }}>
                        <TextField
                          inputRef={rfEmail}
                          type="email"
                          label="Email Address"
                          fullWidth
                          size="small"
                          variant="outlined"
                          autoComplete="email"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: BRAND_BLUE, fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={fieldSx}
                        />

                        <TextField
                          inputRef={rfPassword}
                          type={showPassword ? "text" : "password"}
                          label="Password"
                          fullWidth
                          size="small"
                          variant="outlined"
                          autoComplete="current-password"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ color: BRAND_BLUE, fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                  aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                  }
                                  sx={{ color: BRAND_BLUE }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff fontSize="small" />
                                  ) : (
                                    <Visibility fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={fieldSx}
                        />

                        <Typography
                          variant="body2"
                          align="center"
                          onClick={() => setOpenResetDialog(true)}
                          sx={{
                            color: BRAND_BLUE,
                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            "&:hover": {
                              color: BRAND_BLUE_DARK,
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Forgot password?
                        </Typography>

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={loading}
                          startIcon={
                            loading ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <Login />
                            )
                          }
                          sx={{
                            py: { xs: 1, sm: 1.25 },
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: { xs: "0.95rem", sm: "1.05rem" },
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            color: "#fff",
                            background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
                            boxShadow: `0 6px 20px rgba(26, 95, 180, 0.4)`,
                            border: `1px solid rgba(245, 197, 24, 0.35)`,
                            transition: "all 0.25s ease",
                            "&:hover": {
                              background: `linear-gradient(135deg, ${BRAND_BLUE_DARK} 0%, ${BRAND_BLUE} 100%)`,
                              boxShadow: `0 8px 28px rgba(26, 95, 180, 0.5), 0 0 0 2px rgba(245, 197, 24, 0.25)`,
                              transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                              background: "rgba(26, 95, 180, 0.4)",
                              color: "rgba(255,255,255,0.8)",
                            },
                          }}
                        >
                          {loading ? "Signing In..." : "Sign In"}
                        </Button>
                      </Stack>
                    </form>
                  </Box>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Slide}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            borderTop: `4px solid ${BRAND_GOLD}`,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Reset Password
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ mb: 2, color: "text.secondary" }}>
            Enter your email address and we&apos;ll send reset instructions.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email Address"
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: BRAND_BLUE }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <DialogActions sx={{ mt: 2, px: 0 }}>
              <Button
                onClick={() => setOpenResetDialog(false)}
                variant="outlined"
                disabled={resetLoading}
                sx={{
                  textTransform: "none",
                  borderColor: BRAND_BLUE,
                  color: BRAND_BLUE,
                  "&:hover": {
                    borderColor: BRAND_BLUE_DARK,
                    backgroundColor: "rgba(26, 95, 180, 0.06)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading}
                startIcon={
                  resetLoading ? <CircularProgress size={16} color="inherit" /> : null
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_BLUE_DARK})`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${BRAND_BLUE_DARK}, ${BRAND_BLUE})`,
                  },
                }}
              >
                {resetLoading ? "Processing..." : "Submit"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
