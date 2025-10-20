/**
 * Profile Page using ProfileManagementModal as full page
 */
import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import ProfileManagementModal from './ProfileManagementModal';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdateSuccess = () => {
    // Refresh user data after update
    const fetchUpdatedProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching updated profile:', err);
      }
    };
    fetchUpdatedProfile();
  };

  const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully');
    // You can add a success notification here if needed
  };

  const handleDeleteAccountSuccess = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <ProfileManagementModal
            open={true} // Always open since this is the profile page
            onClose={() => window.history.back()} // Go back when closed
            currentUserProfile={user}
            onProfileUpdateSuccess={handleProfileUpdateSuccess}
            onPasswordChangeSuccess={handlePasswordChangeSuccess}
            onDeleteAccountSuccess={handleDeleteAccountSuccess}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;