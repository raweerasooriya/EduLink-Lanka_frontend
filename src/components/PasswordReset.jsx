//--------------IT23168190 - R A WEERASOORIYA---------------------


import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import emailjs from 'emailjs-com';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  LinearProgress,
  FormHelperText,
  Divider,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import {
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const SERVICE_ID = 'service_4womfbl';
const TEMPLATE_ID = 'template_kbnk5pc';
const PUBLIC_KEY = 'U6gH6RkL_M1ycqlmQ';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e40af' }, // Indigo 800
    secondary: { main: '#0ea5e9' }, // Sky 500
    background: { default: '#eef2ff' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h5: { fontWeight: 800 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 999 } } },
  },
});

theme = responsiveFontSizes(theme);

function passwordScore(pw = '') {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..5
}

const validatePassword = (newPassword, confirmPassword) => {
  const errs = [];
  
  // Check minimum length first
  if (newPassword.length < 8) {
    errs.push("Password must be at least 8 characters long");
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(newPassword)) {
    errs.push("Include at least one uppercase letter (A-Z)");
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(newPassword)) {
    errs.push("Include at least one lowercase letter (a-z)");
  }
  
  // Check for numbers
  if (!/[0-9]/.test(newPassword)) {
    errs.push("Include at least one number (0-9)");
  }
  
  // Check if passwords match
  if (newPassword !== confirmPassword) {
    errs.push("Passwords do not match");
  }
  
  return errs;
};


const PasswordReset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: ask email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [serverOtp, setServerOtp] = useState(''); // keep in memory for comparison
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const otp = useMemo(() => otpArray.join(''), [otpArray]);
  const isPasswordMatch = useMemo(
    () => newPassword && confirmPassword && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  useEffect(() => {
    const id = step === 1 ? 'email' : step === 2 ? 'otp-0' : 'new-password';
    const el = document.getElementById(id);
    if (el) el.focus();
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setSending(true);
    try {
      // Verify email exists on server
      await axios.post('http://localhost:5000/api/users/verify-email', { email });

      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(generatedOtp);

      // Send via EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { otp: generatedOtp, email },
        PUBLIC_KEY
      );

      setOtpArray(['', '', '', '', '', '']);
      setSuccess(`OTP sent to ${email}.`);
      setStep(2);
      setResendTimer(60); // 60s cooldown
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Failed to send OTP';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!otp) return setError('Please enter the OTP');
    if (otp.trim() !== serverOtp.trim()) {
      return setError('Invalid OTP. Please try again.');
    }
    setStep(3);
    setSuccess('OTP verified. You can now set a new password.');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate password
    const passwordErrors = validatePassword(newPassword, confirmPassword);
    if (passwordErrors.length > 0) {
      // Show all errors joined with commas
      setError(passwordErrors.join(', '));
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', {
        email,
        newPassword,
      });
      setSuccess('Password reset successful. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Failed to reset password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const next = [...otpArray];
    next[index] = value;
    setOtpArray(next);
    if (value && index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      if (nextEl) nextEl.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      const prevEl = document.getElementById(`otp-${index - 1}`);
      if (prevEl) prevEl.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevEl = document.getElementById(`otp-${index - 1}`);
      if (prevEl) prevEl.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      if (nextEl) nextEl.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').trim();
    if (!/^\d{4,6}$/.test(paste)) return;
    const arr = paste.slice(0, 6).split('');
    const filled = ['','','','','',''];
    for (let i = 0; i < arr.length; i++) filled[i] = arr[i];
    setOtpArray(filled);
    const lastIndex = Math.min(arr.length - 1, 5);
    const el = document.getElementById(`otp-${lastIndex}`);
    if (el) el.focus();
  };

  const handleKeyPress = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) setCapsLockOn(true);
    else setCapsLockOn(false);
  };

  const pwScore = passwordScore(newPassword);
  const pwLabels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong', 'Excellent']; // 0..5

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight="100vh"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          background:
            'radial-gradient(1200px 600px at -10% -10%, rgba(14,165,233,0.25), transparent 60%), radial-gradient(1000px 500px at 110% 120%, rgba(30,64,175,0.25), transparent 60%)',
        }}
      >
        {/* Left showcase panel */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', p: 4 }}>
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              flex: 1,
              overflow: 'hidden',
              background:
                'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-1516383607781-913a19294fd1?q=80&w=2000&auto=format&fit=crop) center/cover no-repeat',
              color: '#fff',
            }}
          >
            <Box sx={{ p: 5, position: 'absolute', bottom: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                Reset your password
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                Securely recover access to your account in three quick steps.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right form panel */}
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ p: { xs: 2, md: 6 } }}>
          <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, width: 520, maxWidth: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <img
                alt="Logo"
                src="https://img.icons8.com/?size=100&id=37215&format=png&color=1e40af"
                width={28}
                height={28}
                style={{ borderRadius: 6 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Reset Password
              </Typography>
            </Box>

            <Stepper activeStep={step - 1} alternativeLabel sx={{ mt: 1, mb: 3 }}>
              {['Email', 'Verify', 'Reset'].map((label) => (
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

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <Box component="form" onSubmit={handleSendOtp} noValidate>
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={sending}
                  endIcon={sending ? null : <ArrowForwardIcon />}
                  sx={{ mt: 2, py: 1.25 }}
                >
                  {sending ? 'Sending…' : 'Send OTP'}
                </Button>
              </Box>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <Box component="form" onSubmit={handleVerifyOtp} noValidate>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Enter the 6‑digit code sent to <strong>{email}</strong>
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 2 }} onPaste={handleOtpPaste}>
                  {otpArray.map((val, i) => (
                    <TextField
                      key={i}
                      id={`otp-${i}`}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 1, style: { textAlign: 'center', fontSize: 22, padding: '12px 0', width: 44 } }}
                    />
                  ))}
                </Box>

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.25 }}>
                  Verify OTP
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  {resendTimer > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Resend available in {resendTimer}s
                    </Typography>
                  ) : (
                    <Button variant="text" color="secondary" onClick={handleSendOtp}>Resend code</Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <Box component="form" onSubmit={handleResetPassword} noValidate>
                <TextField
                  id="new-password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  fullWidth
                  required
                  margin="normal"
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
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  error={Boolean(confirmPassword) && !isPasswordMatch}
                  helperText={Boolean(confirmPassword) && !isPasswordMatch ? 'Passwords do not match' : ' '}
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

                {capsLockOn && (
                  <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mt: 1 }}>
                    Caps Lock is on
                  </Alert>
                )}

                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress variant="determinate" value={(passwordScore(newPassword) / 5) * 100} sx={{ height: 8, borderRadius: 999, flex: 1 }} />
                    <Typography variant="caption" sx={{ minWidth: 78 }}>
                      {pwLabels[pwScore]}
                    </Typography>
                  </Box>
                  <FormHelperText>Use 8+ chars with upper/lowercase, numbers & symbols.</FormHelperText>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button type="button" variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setStep(2)} fullWidth>
                    Back
                  </Button>
                  <Button type="submit" variant="contained" fullWidth disabled={!isPasswordMatch || passwordScore(newPassword) < 3 || loading} endIcon={loading ? null : <ArrowForwardIcon />} sx={{ py: 1.25 }}>
                    {loading ? 'Saving…' : 'Reset Password'}
                  </Button>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Tip: Press Enter to submit each step. You can paste a full 6‑digit code into any OTP box.
            </Typography>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Remembered your password?{' '}
              <Button size="small" onClick={() => navigate('/login')}>Go to Login</Button>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PasswordReset;