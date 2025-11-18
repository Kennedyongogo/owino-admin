import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import {
  Construction,
  Save,
  ArrowBack,
  Add,
  Close,
  Image as ImageIcon,
  AttachFile,
  Upload,
  MyLocation,
  Search as SearchIcon,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    location_name: "",
    latitude: "",
    longitude: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget_estimate: "",
    actual_cost: "",
    currency: "KES",
    contractor_name: "",
    client_name: "",
    funding_source: "",
    engineer_in_charge: "",
    progress_percent: 0,
    notes: "",
    floor_size: "",
    construction_type: "building",
  });
  const [blueprintFiles, setBlueprintFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [blueprintPreviews, setBlueprintPreviews] = useState([]);

  // Map related states
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const statusOptions = [
    { value: "planning", label: "Planning", color: "#ff9800" },
    { value: "in_progress", label: "In Progress", color: "#2196f3" },
    { value: "completed", label: "Completed", color: "#4caf50" },
    { value: "on_hold", label: "On Hold", color: "#f44336" },
    { value: "cancelled", label: "Cancelled", color: "#9e9e9e" },
  ];

  const currencyOptions = [
    { value: "KES", label: "Kenyan Shilling (KES)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setEngineers(result.data);
      }
    } catch (err) {
      console.error("Error fetching engineers:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate previews for image files
    const newPreviews = [...filePreviews];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setFilePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push(null);
        setFilePreviews([...newPreviews]);
      }
    });
  };

  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleBlueprintFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [...blueprintFiles, ...files];
    setBlueprintFiles(newFiles);

    // Generate previews for image files
    const newPreviews = [...blueprintPreviews];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setBlueprintPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push(null);
        setBlueprintPreviews([...newPreviews]);
      }
    });
  };

  const removeBlueprintFile = (index) => {
    const newFiles = blueprintFiles.filter((_, i) => i !== index);
    const newPreviews = blueprintPreviews.filter((_, i) => i !== index);
    setBlueprintFiles(newFiles);
    setBlueprintPreviews(newPreviews);
  };

  // Geocoding search function
  const searchPlace = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "OwinoInteriors/1.0",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching place:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle place selection from search
  const handlePlaceSelect = (place) => {
    if (place) {
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      handleInputChange("latitude", lat);
      handleInputChange("longitude", lon);
      if (place.display_name) {
        handleInputChange("location_name", place.display_name);
      }

      // Center map on selected place
      if (mapInstance.current) {
        const view = mapInstance.current.getView();
        view.setCenter(fromLonLat([lon, lat]));
        view.setZoom(15);
        updateMarker(lon, lat);
      }
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleInputChange("latitude", latitude);
        handleInputChange("longitude", longitude);

        // Center map on current location
        if (mapInstance.current) {
          const view = mapInstance.current.getView();
          view.setCenter(fromLonLat([longitude, latitude]));
          view.setZoom(15);
          updateMarker(longitude, latitude);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to retrieve your location. Please check your permissions.",
        });
        setIsGettingLocation(false);
      }
    );
  };

  // Update marker on map
  const updateMarker = (lon, lat) => {
    if (!mapInstance.current || !vectorLayerRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    vectorSource.clear();

    const feature = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });

    feature.setStyle(
      new Style({
        image: new Icon({
          src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#667eea" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
              <circle cx="16" cy="16" r="3" fill="#667eea"/>
            </svg>
          `)}`,
          scale: 1,
          anchor: [0.5, 0.5],
        }),
      })
    );

    vectorSource.addFeature(feature);
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      const osmLayer = new TileLayer({
        source: new OSM(),
      });

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });
      vectorLayerRef.current = vectorLayer;

      const map = new Map({
        target: mapRef.current,
        layers: [osmLayer, vectorLayer],
        view: new View({
          center: fromLonLat([36.7758, -1.2921]), // Default to Nairobi, Kenya
          zoom: 10,
        }),
        controls: defaultControls(),
      });

      // Handle map click
      map.on("click", (event) => {
        const [lon, lat] = toLonLat(event.coordinate);
        handleInputChange("latitude", lat);
        handleInputChange("longitude", lon);
        updateMarker(lon, lat);
      });

      mapInstance.current = map;
      setMapInitialized(true);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  // Update marker when coordinates change manually
  useEffect(() => {
    if (
      mapInitialized &&
      projectForm.latitude &&
      projectForm.longitude &&
      !isNaN(parseFloat(projectForm.latitude)) &&
      !isNaN(parseFloat(projectForm.longitude))
    ) {
      const lat = parseFloat(projectForm.latitude);
      const lon = parseFloat(projectForm.longitude);
      if (mapInstance.current) {
        const view = mapInstance.current.getView();
        const currentCenter = toLonLat(view.getCenter());
        // Only update marker if coordinates are significantly different
        if (
          Math.abs(currentCenter[0] - lon) > 0.001 ||
          Math.abs(currentCenter[1] - lat) > 0.001
        ) {
          updateMarker(lon, lat);
        }
      }
    }
  }, [projectForm.latitude, projectForm.longitude, mapInitialized]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPlace(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreate = async () => {
    try {
      setSaving(true);

      // Prepare form data for project creation with both blueprint and document files
      const formData = new FormData();

      // Add all project form fields
      Object.keys(projectForm).forEach((key) => {
        if (projectForm[key] !== null && projectForm[key] !== undefined) {
          formData.append(key, projectForm[key]);
        }
      });

      // Add document files directly (not through document API)
      selectedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      // Add blueprint files
      blueprintFiles.forEach((file) => {
        formData.append("blueprints", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Project created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create project",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      projectForm.name.trim() &&
      projectForm.location_name.trim() &&
      projectForm.start_date &&
      projectForm.engineer_in_charge
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 0 },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: { xs: 2, sm: 3 },
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 2, sm: 2 },
            mb: { xs: 2, sm: 4 },
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 2 }}
            sx={{
              position: "relative",
              zIndex: 1,
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <IconButton
              onClick={() => navigate("/projects")}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ArrowBack sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
            <Construction
              sx={{
                fontSize: { xs: 28, sm: 40 },
                display: { xs: "none", sm: "block" },
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                wordBreak: "break-word",
              }}
            >
              Create New Project
            </Typography>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: { xs: 1.5, sm: 2 }, position: "relative", zIndex: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ width: "100%" }}>
          {/* Basic Information */}
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Construction
                    sx={{ color: "#667eea", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    Basic Information
                  </Typography>
                </Box>

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ flexDirection: "column" }}
                >
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={projectForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={projectForm.location_name}
                      onChange={(e) =>
                        handleInputChange("location_name", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>

                  {/* Map Component for Location Selection */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        backgroundColor: "white",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e0e0e0",
                        borderRadius: { xs: 2, sm: 3 },
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={{ xs: 1.5, sm: 2 }}
                        >
                          <LocationOn
                            sx={{
                              color: "#667eea",
                              fontSize: { xs: 20, sm: 24 },
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#333",
                              fontSize: { xs: "1rem", sm: "1.125rem" },
                              fontWeight: 700,
                            }}
                          >
                            Select Location on Map
                          </Typography>
                        </Box>

                        {/* Search Bar */}
                        <Box mb={{ xs: 1.5, sm: 2 }}>
                          <Autocomplete
                            freeSolo
                            options={searchResults}
                            getOptionLabel={(option) =>
                              typeof option === "string"
                                ? option
                                : option.display_name || ""
                            }
                            loading={isSearching}
                            onInputChange={(event, newValue) => {
                              setSearchQuery(newValue);
                            }}
                            onChange={(event, newValue) => {
                              if (newValue && typeof newValue !== "string") {
                                handlePlaceSelect(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search for a place..."
                                size="small"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <InputAdornment position="start">
                                        <SearchIcon />
                                      </InputAdornment>
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                  endAdornment: (
                                    <>
                                      {isSearching ? (
                                        <CircularProgress size={20} />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box
                                component="li"
                                {...props}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  py: 1,
                                }}
                              >
                                <LocationOn
                                  sx={{ color: "#667eea", fontSize: 20 }}
                                />
                                <Typography variant="body2">
                                  {option.display_name}
                                </Typography>
                              </Box>
                            )}
                          />
                        </Box>

                        {/* Action Buttons */}
                        <Box
                          display="flex"
                          gap={1}
                          mb={{ xs: 1.5, sm: 2 }}
                          flexWrap="wrap"
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={
                              isGettingLocation ? (
                                <CircularProgress size={16} />
                              ) : (
                                <MyLocation />
                              )
                            }
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            sx={{
                              textTransform: "none",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              py: { xs: 0.75, sm: 1 },
                              px: { xs: 1.5, sm: 2 },
                              borderColor: "#667eea",
                              color: "#667eea",
                              "&:hover": {
                                borderColor: "#5a6fd8",
                                backgroundColor: "rgba(102, 126, 234, 0.08)",
                              },
                            }}
                          >
                            {isGettingLocation
                              ? "Getting Location..."
                              : "Use Current Location"}
                          </Button>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              alignSelf: "center",
                              ml: "auto",
                            }}
                          >
                            Click on map to set coordinates
                          </Typography>
                        </Box>

                        {/* Map Container */}
                        <Box
                          ref={mapRef}
                          sx={{
                            width: "100%",
                            height: { xs: 300, sm: 400, md: 450 },
                            borderRadius: { xs: 2, sm: 2 },
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            position: "relative",
                            "& .ol-zoom": {
                              top: "0.5em",
                              left: "0.5em",
                            },
                            "& .ol-zoom-in, & .ol-zoom-out": {
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "32px",
                              height: "32px",
                              lineHeight: "32px",
                            },
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      value={projectForm.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      value={projectForm.longitude}
                      onChange={(e) =>
                        handleInputChange("longitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Construction
                    sx={{ color: "#f093fb", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    Financial Information
                  </Typography>
                </Box>

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ flexDirection: "column" }}
                >
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Budget Estimate"
                      type="number"
                      value={projectForm.budget_estimate}
                      onChange={(e) =>
                        handleInputChange("budget_estimate", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Actual Cost"
                      type="number"
                      value={projectForm.actual_cost}
                      onChange={(e) =>
                        handleInputChange("actual_cost", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={projectForm.currency}
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                        label="Currency"
                      >
                        {currencyOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stakeholders */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Construction
                    sx={{ color: "#4facfe", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    Stakeholders
                  </Typography>
                </Box>

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ flexDirection: "column" }}
                >
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contractor Name"
                      value={projectForm.contractor_name}
                      onChange={(e) =>
                        handleInputChange("contractor_name", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={projectForm.client_name}
                      onChange={(e) =>
                        handleInputChange("client_name", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Funding Source"
                      value={projectForm.funding_source}
                      onChange={(e) =>
                        handleInputChange("funding_source", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={projectForm.engineer_in_charge}
                      onChange={(e) =>
                        handleInputChange("engineer_in_charge", e.target.value)
                      }
                      required
                      select
                      placeholder="Engineer in Charge"
                      SelectProps={{
                        native: false,
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return (
                              <span style={{ color: "#999" }}>
                                Engineer in Charge
                              </span>
                            );
                          }
                          const engineer = engineers.find(
                            (eng) => eng.id === selected
                          );
                          return engineer
                            ? `${engineer.name} (${engineer.role})`
                            : "";
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      {engineers.map((engineer) => (
                        <MenuItem key={engineer.id} value={engineer.id}>
                          {engineer.name} ({engineer.role})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Project Status & Progress */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Construction
                    sx={{ color: "#43e97b", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    Project Status & Progress
                  </Typography>
                </Box>

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ flexDirection: "column" }}
                >
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={projectForm.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        label="Status"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Progress Percentage"
                      type="number"
                      value={projectForm.progress_percent}
                      onChange={(e) =>
                        handleInputChange("progress_percent", e.target.value)
                      }
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={projectForm.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Floor Size (m²)"
                      type="number"
                      value={projectForm.floor_size}
                      onChange={(e) =>
                        handleInputChange("floor_size", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Construction Type</InputLabel>
                      <Select
                        value={projectForm.construction_type}
                        onChange={(e) =>
                          handleInputChange("construction_type", e.target.value)
                        }
                        label="Construction Type"
                      >
                        <MenuItem value="building">Building</MenuItem>
                        <MenuItem value="infrastructure">
                          Infrastructure
                        </MenuItem>
                        <MenuItem value="industrial">Industrial</MenuItem>
                        <MenuItem value="specialized">Specialized</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Upload
                    sx={{ color: "#fa709a", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    File Upload
                  </Typography>
                </Box>

                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Add />}
                    fullWidth
                    sx={{
                      color: "#fa709a",
                      borderColor: "#fa709a",
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "#fa709a",
                        backgroundColor: "rgba(250, 112, 154, 0.1)",
                        transform: { xs: "none", sm: "translateY(-2px)" },
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Select Files
                  </Button>
                </label>

                {selectedFiles.length > 0 && (
                  <Box mt={{ xs: 1.5, sm: 2 }}>
                    <Typography
                      variant="subtitle2"
                      mb={1}
                      sx={{ fontSize: { xs: "0.875rem", sm: "0.95rem" } }}
                    >
                      Selected Files:
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      {selectedFiles.map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 1,
                              border: "1px solid #e0e0e0",
                              position: "relative",
                            }}
                          >
                            <IconButton
                              onClick={() => removeSelectedFile(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                color: "#666",
                                p: 0.5,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                            {filePreviews[index] ? (
                              <img
                                src={filePreviews[index]}
                                alt={file.name}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              />
                            ) : (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AttachFile />
                                <Typography variant="caption">
                                  {file.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Blueprint Management */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={{ xs: 2, sm: 3 }}
                >
                  <Construction
                    sx={{ color: "#ff6b6b", fontSize: { xs: 24, sm: 28 } }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#333",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 700,
                    }}
                  >
                    Project Blueprints
                  </Typography>
                </Box>

                {/* Blueprint File Upload */}
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  onChange={handleBlueprintFileSelect}
                  style={{ display: "none" }}
                  id="blueprint-upload"
                />
                <label htmlFor="blueprint-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Add />}
                    fullWidth
                    sx={{
                      color: "#ff6b6b",
                      borderColor: "#ff6b6b",
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      mb: { xs: 1.5, sm: 2 },
                      "&:hover": {
                        borderColor: "#ff6b6b",
                        backgroundColor: "rgba(255, 107, 107, 0.1)",
                        transform: { xs: "none", sm: "translateY(-2px)" },
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Select Blueprint Files
                  </Button>
                </label>

                {/* Selected Blueprint Files */}
                {blueprintFiles.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      mb={1}
                      sx={{ fontSize: { xs: "0.875rem", sm: "0.95rem" } }}
                    >
                      Selected Blueprint Files:
                    </Typography>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      {blueprintFiles.map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 1,
                              border: "1px solid #e0e0e0",
                              position: "relative",
                            }}
                          >
                            <IconButton
                              onClick={() => removeBlueprintFile(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                color: "#666",
                                p: 0.5,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                            {blueprintPreviews[index] ? (
                              <img
                                src={blueprintPreviews[index]}
                                alt={file.name}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              />
                            ) : (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AttachFile />
                                <Typography variant="caption">
                                  {file.name}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                display: "block",
                                textAlign: "center",
                                wordBreak: "break-word",
                              }}
                            >
                              {file.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                borderRadius: { xs: 2, sm: 3 },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={{ xs: 2, sm: 2 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth={isSmallScreen}
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleCreate}
                    disabled={!isFormValid() || saving}
                    sx={{
                      flex: { xs: "none", sm: 1 },
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 3,
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        transform: { xs: "none", sm: "translateY(-2px)" },
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                      },
                      "&:disabled": {
                        background: "#e0e0e0",
                        color: "#999",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {saving ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth={isSmallScreen}
                    onClick={() => navigate("/projects")}
                    sx={{
                      flex: { xs: "none", sm: 1 },
                      color: "#667eea",
                      borderColor: "#667eea",
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 3,
                      "&:hover": {
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        transform: { xs: "none", sm: "translateY(-2px)" },
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectCreate;
