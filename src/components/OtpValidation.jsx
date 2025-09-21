import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

const OtpValidation = ({ onValidate }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onValidate(otp);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
          Enter OTP
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
          An OTP has been sent to your email address. Please enter it below to verify your account.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="OTP"
            variant="outlined"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Verify OTP
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default OtpValidation;
