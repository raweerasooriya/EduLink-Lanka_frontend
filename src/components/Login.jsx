//--------------IT23168190 - R A WEERASOORIYA---------------------

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

let theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e40af" }, // Indigo 800
    secondary: { main: "#0ea5e9" }, // Sky 500
    background: { default: "#eef2ff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
    h5: { fontWeight: 800 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700, borderRadius: 999 } } },
  },
});

theme = responsiveFontSizes(theme);

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // focus first field automatically
  useEffect(() => {
    const id = step === 1 ? "username" : "password";
    const el = document.getElementById(id);
    if (el) el.focus();
  }, [step]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login-step-one",
        { username }
      );
      setProfileImage(res.data.profileImage);
      setStep(2);
    } catch (err) {
      if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError("An unexpected error occurred.");
      }
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login-step-two",
        { username, password }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      localStorage.setItem("role", decoded.user.role);

      switch (decoded.user.role) {
        case "Admin":
          navigate("/admin/dashboard");
          break;
        case "Teacher":
          navigate("/teacher/dashboard");
          break;
        case "Student":
          navigate("/student/dashboard");
          break;
        case "Parent":
          navigate("/parent/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      localStorage.removeItem("token");
      setError(
        err.response?.data?.msg || "Invalid password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    // Detect CapsLock for password field
    if (e.getModifierState && e.getModifierState("CapsLock")) setCapsLockOn(true);
    else setCapsLockOn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight="100vh"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          background:
            "radial-gradient(1200px 600px at -10% -10%, rgba(14,165,233,0.25), transparent 60%), radial-gradient(1000px 500px at 110% 120%, rgba(30,64,175,0.25), transparent 60%)",
        }}
      >
        {/* Left showcase panel */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "stretch",
            justifyContent: "stretch",
            p: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-1516383607781-913a19294fd1?q=80&w=2000&auto=format&fit=crop) center/cover no-repeat",
              color: "#fff",
            }}
          >
            <Box sx={{ p: 5, position: "absolute", bottom: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                Sign in to access your dashboard, classes, and messages.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right form panel */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ p: { xs: 2, md: 6 } }}
        >
          <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, width: 440, maxWidth: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <img
                alt="Logo"
                src="https://img.icons8.com/?size=100&id=37215&format=png&color=1e40af"
                width={28}
                height={28}
                style={{ borderRadius: 6 }}
                onClick={() => navigate("/")}
              />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Sign in
              </Typography>
            </Box>

            <Stepper activeStep={step - 1} alternativeLabel sx={{ mt: 1, mb: 3 }}>
              {["Account", "Password"].map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {step === 1 ? (
              <Box component="form" onSubmit={handleUsernameSubmit} noValidate>
                <TextField
                  id="username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!username || loading}
                  endIcon={loading ? null : <ArrowForwardIcon />}
                  sx={{ mt: 2, py: 1.25 }}
                >
                  {loading ? <CircularProgress size={22} /> : "Next"}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                  Don't have an account?{" "}
                  <Link to="/Register" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                    Create Account
                  </Link>
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={profileImage}
                      alt="Profile"
                      sx={{ width: 84, height: 84, border: `3px solid ${theme.palette.primary.main}` }}
                    />
                    <Tooltip title="Use a different account">
                      <IconButton
                        onClick={() => {
                          setStep(1);
                          setPassword("");
                          setError("");
                        }}
                        size="small"
                        sx={{ position: "absolute", bottom: -6, right: -6, bgcolor: "background.paper", boxShadow: 1 }}
                      >
                        <ArrowBackIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    {username}
                  </Typography>
                </Box>

                <TextField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  fullWidth
                  margin="normal"
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="toggle password visibility">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {capsLockOn && (
                  <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mt: 1 }}>
                    Caps Lock is on
                  </Alert>
                )}

                <FormControlLabel
                  control={<Checkbox defaultChecked={true} />}
                  label="Remember me"
                  sx={{ mt: 1 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!password || loading}
                  endIcon={loading ? null : <ArrowForwardIcon />}
                  sx={{ mt: 2, py: 1.25 }}
                >
                  {loading ? <CircularProgress size={22} /> : "Login"}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                  Forgot your password?{" "}
                  <Link to="/reset-password" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                    Reset Password
                  </Link>
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Tip: You can hit Enter to submit each step.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;