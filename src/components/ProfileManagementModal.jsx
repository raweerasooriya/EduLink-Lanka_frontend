/**
 * This component creates a reusable pop-up modal (a dialog box) to manage a user's profile.
 * It's designed to be flexible and can be used anywhere in the application.
 * For example, an admin can use it to edit a student's profile, or a user can use it to edit their own.
 *
 * It handles:
 * 1. Updating profile details (name, username, mobile, image).
 * 2. Changing a password.
 * 3. Deleting an account.
 *
 * It receives the user's data from a parent component and reports back when an action is complete.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Alert, Avatar, Box } from '@mui/material';


const ProfileManagementModal = ({ open, onClose, userId, onPasswordChangeSuccess, onDeleteAccountSuccess, currentUserProfile, onProfileUpdateSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [profileImageUpdateError, setProfileImageUpdateError] = useState('');
  const [profileImageUpdateSuccess, setProfileImageUpdateSuccess] = useState('');
  const [name, setName] = useState(currentUserProfile?.name || '');
  const [username, setUsername] = useState(currentUserProfile?.username || '');
  const [mobile, setMobile] = useState(currentUserProfile?.mobile || '');

  React.useEffect(() => {
    setName(currentUserProfile?.name || '');
    setUsername(currentUserProfile?.username || '');
    setMobile(currentUserProfile?.mobile || '');
  }, [currentUserProfile]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileImageUpdateError('File size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setProfileImageUpdateError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setNewProfileImage(reader.result);
        setProfileImageUpdateError(''); // Clear any previous errors
      }
    };
    reader.onerror = () => {
      setProfileImageUpdateError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    setProfileImageUpdateError('');
    setProfileImageUpdateSuccess('');
    
    if (!name.trim() || !username.trim()) {
      setProfileImageUpdateError('Name and username are required');
      return;
    }

    // Add mobile validation
    const mobileError = validateMobile(mobile);
    if (mobileError) {
      setProfileImageUpdateError(mobileError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileImageUpdateError('No authentication token found');
        return;
      }

      const updateData = {
        name: name.trim(),
        username: username.trim(),
        mobile: mobile.trim() || null, // Handle empty mobile field
      };

      // Only include profileImage if a new one was selected
      if (newProfileImage) {
        updateData.profileImage = newProfileImage;
      }

      console.log('Updating profile with data:', { ...updateData, profileImage: newProfileImage ? 'Base64 image data' : 'No new image' });

      const response = await axios.put('http://localhost:5000/api/users/profile', updateData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
      });

      console.log('Profile update response:', response.data);
      
      setProfileImageUpdateSuccess('Profile updated successfully');
      setNewProfileImage(''); // Clear the new image state
      
      if (onProfileUpdateSuccess) {
        onProfileUpdateSuccess();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Failed to update profile';
      setProfileImageUpdateError(errorMessage);
    }
  };

  const validateMobile = (mobileNumber) => {
    const mobile = mobileNumber.trim();
    
    // Check if starts with 0
    if (!mobile.startsWith('0')) {
      return 'Mobile number must start with 0';
    }
    
    // Check if exactly 10 digits
    if (mobile.length !== 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    
    // Check if contains only numbers
    if (!/^\d+$/.test(mobile)) {
      return 'Mobile number must contain only numbers';
    }
    
    return null; // No error
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers
    };
  };

  const handleChangePassword = async () => {
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    
    // Validation 1: Check if current password is provided
    if (!currentPassword) {
      setPasswordChangeError('Current password is required to set a new password.');
      return;
    }
    
    // Validation 2: Check if new password is different from current password
    if (currentPassword === newPassword) {
      setPasswordChangeError('New password cannot be the same as current password.');
      return;
    }
    
    // Validation 3: Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }
    
    // Validation 4: Check password strength requirements
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordChangeError(`Password must contain at least ${passwordValidation.minLength} characters, including uppercase letters, lowercase letters, and numbers.`);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          'x-auth-token': token,
        },
      });
      setPasswordChangeSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (onPasswordChangeSuccess) {
        onPasswordChangeSuccess();
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordChangeError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError('');
    setDeleteAccountSuccess('');
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5000/api/users/profile', {
          headers: {
            'x-auth-token': token,
          },
        });
        setDeleteAccountSuccess('Account deleted successfully');
        onDeleteAccountSuccess();
      } catch (err) {
        console.error('Error deleting account:', err);
        setDeleteAccountError(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Manage Profile</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="h6">Edit Profile</Typography>
          {profileImageUpdateError && <Alert severity="error">{profileImageUpdateError}</Alert>}
          {profileImageUpdateSuccess && <Alert severity="success">{profileImageUpdateSuccess}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={newProfileImage || currentUserProfile?.profileImage}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {!newProfileImage && !currentUserProfile?.profileImage && (name?.[0] || username?.[0] || 'U')}
            </Avatar>
            <Button 
              variant="contained" 
              component="label"
              sx={{ mb: 1 }}
            >
              {newProfileImage ? 'Change Image' : 'Select New Image'}
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={onFileChange} 
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </Typography>
            {newProfileImage && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  setNewProfileImage('');
                  setProfileImageUpdateError('');
                }}
                sx={{ mt: 1 }}
              >
                Remove New Image
              </Button>
            )}
          </Box>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth />
          <TextField label="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleUpdateProfile}>Save Changes</Button>

          <Typography variant="h6">Change Password</Typography>
          {passwordChangeError && <Alert severity="error">{passwordChangeError}</Alert>}
          {passwordChangeSuccess && <Alert severity="success">{passwordChangeSuccess}</Alert>}
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            helperText="Enter your current password to set a new one"
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            helperText="Must contain uppercase, lowercase letters, numbers, and be at least 8 characters long"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            fullWidth
            helperText="Re-enter your new password"
          />
          <Button variant="contained" onClick={handleChangePassword}>Change Password</Button>

          <Typography variant="h6" sx={{ mt: 4 }}>Delete Account</Typography>
          {deleteAccountError && <Alert severity="error">{deleteAccountError}</Alert>}
          {deleteAccountSuccess && <Alert severity="success">{deleteAccountSuccess}</Alert>}
          <Button variant="contained" color="error" onClick={handleDeleteAccount}>Delete Account</Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileManagementModal;