/**
 * IT23569454 - De Silva K.S.D
 * This component creates a dedicated "My Profile" page.
 * It allows a logged-in user to:
 * 1. View their current profile information (username, image).
 * 2. Update their username and upload a new profile picture.
 * 3. Change their password.
 * 4. Securely delete their own account.
 * It is a self-contained page that fetches its own data from the server.
 */


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
        setNewUsername(res.data.username);
      } catch (err) {
        console.error(err.response?.data);
      }
    };
    fetchProfile();
  }, []);

  const onFileChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setNewProfileImage(reader.result);
      }
    };
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedProfile = {};
      if (newUsername !== user.username) updatedProfile.username = newUsername;
      if (newProfileImage) updatedProfile.profileImage = newProfileImage;

      const res = await axios.put('http://localhost:5000/api/users/profile', updatedProfile, {
        headers: { 'x-auth-token': token },
      });
      setUser(res.data);
      setNewProfileImage('');
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { 'x-auth-token': token } }
      );
      setMessage(res.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password.');
    }
  };

  const handleDeleteAccount = async () => {
    setMessage('');
    setError('');
    if (deleteConfirmationInput !== 'confirm') {
      setError('Please type "confirm" to delete your account.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/profile', {
        headers: { 'x-auth-token': token },
      });
      setMessage('Account deleted successfully.');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting account.');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" sx={{ mt: 4 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Profile
          </Typography>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Profile Update Form */}
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={newProfileImage || user.profileImage}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Button variant="contained" component="label">
                Upload Profile Image
                <input type="file" hidden onChange={onFileChange} />
              </Button>
            </Box>
            <TextField
              fullWidth
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Update Profile
            </Button>
          </Box>

          {/* Change Password */}
          <Typography variant="h6" sx={{ mt: 4 }}>
            Change Password
          </Typography>
          <Box component="form" onSubmit={handleChangePassword}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Change Password
            </Button>
          </Box>

          {/* Delete Account */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 4 }}
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Account
          </Button>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)}>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Type <strong>confirm</strong> to delete your account:
              </Typography>
              <TextField
                fullWidth
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationInput !== 'confirm'}
              >
                Confirm Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
