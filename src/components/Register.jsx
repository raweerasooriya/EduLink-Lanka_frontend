//--------------IT23168190 - R A WEERASOORIYA---------------------


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import emailjs from "emailjs-com";
import OtpValidation from "./OtpValidation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  Alert,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Divider,
  InputAdornment,
  IconButton,
  LinearProgress,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import {
  Person as PersonIcon,
  AlternateEmail as AlternateEmailIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhoneIphone as PhoneIphoneIcon,
  Upload as UploadIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  School as SchoolIcon,
  FamilyRestroom as FamilyRestroomIcon,
  Verified as VerifiedIcon,
  Image as ImageIcon,
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

const steps = ["Account", "Verify", "Details"];

const roleItems = [
  { value: "Admin", label: "Admin", icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { value: "Teacher", label: "Teacher", icon: <SchoolIcon fontSize="small" /> },
  { value: "Student", label: "Student", icon: <VerifiedIcon fontSize="small" /> },
  { value: "Parent", label: "Parent", icon: <FamilyRestroomIcon fontSize="small" /> },
];

function passwordScore(pw = "") {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..5
}

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    profileImage: "",
    role: "Student",
  });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  const { name, username, email, password, confirmPassword, mobile, profileImage, role } = formData;

  useEffect(() => {
    const id = step === 1 ? "name" : step === 2 ? "otp-input-0" : "mobile"; // focuses first OTP box if your OtpValidation sets these ids
    const el = document.getElementById(id);
    if (el) el.focus();
  }, [step]);

  const onChange = (e) => {
    if (e.target.name === "profileImage") {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setFormData((prev) => ({ ...prev, profileImage: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validateStep1 = () => {
    const errs = [];
    if (!name.trim()) errs.push("Full name is required");
    if (!username.trim()) errs.push("Username is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push("Valid email is required");
    if (password !== confirmPassword) errs.push("Passwords do not match");
    if (passwordScore(password) < 3) errs.push("Password is too weak");
    return errs;
  };

  const handleNext = async () => {
    setError("");
    setSuccess("");
    const errs = validateStep1();
    if (errs.length) {
      setError(errs[0]);
      return;
    }
    await sendOtp();
  };

  const handleBack = () => {
    setError("");
    setSuccess("");
    setStep((s) => Math.max(1, s - 1));
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    setError("");
    setSuccess("");
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      const templateParams = { passcode: otp, email };
      await emailjs.send("service_4womfbl", "template_d5slx9b", templateParams, "U6gH6RkL_M1ycqlmQ");
      setSuccess(`We sent a 6‑digit code to ${email}.`);
      setStep(2);
    } catch (err) {
      console.error("OTP send failed", err);
      setError("Failed to send OTP. Please check the email and try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpValidation = (enteredOtp) => {
    setError("");
    if (enteredOtp === generatedOtp) {
      setStep(3);
      setSuccess("Email verified ✔");
    } else {
      setError("Invalid OTP");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name,
        username,
        email,
        password,
        mobile,
        profileImage,
        role,
      });
      console.log(res.data);
      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) setCapsLockOn(true);
    else setCapsLockOn(false);
  };

  const pwScore = passwordScore(password);
  const pwLabels = ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"]; // 0..5

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
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "stretch", p: 4 }}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://sjps.edu.in/wp-content/uploads/2024/09/SIRUSERI-1-840x560.jpg) center/cover no-repeat",
              color: "#fff",
            }}
          >
            <Box sx={{ p: 5, position: "absolute", bottom: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                Create your account
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                Join the community and access classes, messages, and payments.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right form panel */}
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ p: { xs: 2, md: 6 } }}>
          <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, width: 520, maxWidth: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <img
                alt="Logo"
                src="https://img.icons8.com/?size=100&id=37215&format=png&color=1e40af"
                width={28}
                height={28}
                style={{ borderRadius: 6 }}
                onClick={() => navigate("/") }
              />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Create Account
              </Typography>
            </Box>

            <Stepper activeStep={step - 1} alternativeLabel sx={{ mt: 1, mb: 3 }}>
              {steps.map((label) => (
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
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Box component="form" onSubmit={(e) => e.preventDefault()} noValidate>
                <Stack spacing={2}>
                  <TextField
                    id="name"
                    label="Full Name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Username"
                    name="username"
                    value={username}
                    onChange={onChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={onChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Password"
                      name="password"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={onChange}
                      onKeyUp={handleKeyPress}
                      fullWidth
                      required
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
                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={onChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" aria-label="toggle password visibility">
                              {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>

                  {capsLockOn && (
                    <FormHelperText sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <InfoIcon fontSize="small" /> Caps Lock is on
                    </FormHelperText>
                  )}

                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress variant="determinate" value={(pwScore / 5) * 100} sx={{ height: 8, borderRadius: 999 }} />
                      </Box>
                      <Typography variant="caption" sx={{ minWidth: 72 }}>
                        {pwLabels[pwScore]}
                      </Typography>
                    </Stack>
                    <FormHelperText>Use 8+ chars with a mix of upper/lowercase, numbers & symbols.</FormHelperText>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select labelId="role-label" id="role" name="role" label="Role" value={role} onChange={onChange}>
                      {roleItems.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {r.icon}
                            <span>{r.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button type="button" variant="contained" fullWidth sx={{ py: 1.25 }} onClick={handleNext} disabled={sendingOtp} endIcon={sendingOtp ? null : <ArrowForwardIcon />}>
                    {sendingOtp ? "Sending code…" : "Next"}
                  </Button>

                  <Typography variant="body2" align="center">
                    Already have an account?{" "}
                    <Button component={RouterLink} to="/login" size="small">Log in</Button>
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Step 2: OTP Validation */}
            {step === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Verify your email
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter the 6‑digit code we sent to <strong>{email}</strong>.
                </Typography>

                <OtpValidation onValidate={handleOtpValidation} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} fullWidth>
                    Back
                  </Button>
                  <Button variant="contained" onClick={sendOtp} disabled={sendingOtp} fullWidth>
                    {sendingOtp ? "Resending…" : "Resend Code"}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    id="mobile"
                    label="Mobile Number"
                    name="mobile"
                    value={mobile}
                    onChange={onChange}
                    fullWidth
                    required
                    placeholder="e.g., +94 7X XXX XXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar src={profileImage} alt="Profile Preview" sx={{ width: 88, height: 88, border: `3px solid ${theme.palette.primary.main}` }}>
                        {!profileImage && <ImageIcon />}
                      </Avatar>
                    </Box>
                    <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ whiteSpace: "nowrap" }}>
                      Upload Profile Image
                      <input type="file" name="profileImage" hidden accept="image/*" onChange={onChange} />
                    </Button>
                  </Stack>

                  <FormControlLabel control={<Checkbox required />} label={(
                    <Typography variant="body2">
                      I agree to the <RouterLink to="#">Terms</RouterLink> and <RouterLink to="#">Privacy Policy</RouterLink>.
                    </Typography>
                  )} />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button type="button" variant="outlined" startIcon={<ArrowBackIcon />} fullWidth onClick={handleBack}>
                      Back
                    </Button>
                    <Button type="submit" variant="contained" fullWidth disabled={loading} endIcon={loading ? null : <ArrowForwardIcon />} sx={{ py: 1.25 }}>
                      {loading ? "Registering…" : "Register"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Tip: Press Enter to submit each step. You can change role and image anytime after signup.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Register;