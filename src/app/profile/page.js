'use client';

import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const fetchProfile = async () => {
    if (!session?.user?.id || !session?.accessToken) {
      throw new Error('No session available');
    }

    const res = await fetch(`/api/v1/users?user_id=${session.user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    return res.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: fetchProfile,
    enabled: !!session?.user?.id && !!session?.accessToken,
  });

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="warning">
          Please log in to view your profile.
          <Button component={Link} href="/login" sx={{ ml: 2 }}>
            Login
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            <AccountCircleIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            User Profile
          </Typography>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {data.data.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                Email Address
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {data.data.email}
              </Typography>
            </Box>

            <Button
              component={Link}
              href={`/profile/${session.user.id}`}
              variant="contained"
              size="large"
              fullWidth
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}