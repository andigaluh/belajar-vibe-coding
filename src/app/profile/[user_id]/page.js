'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userId = params.user_id;

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch current data
  const { data: profileData, isLoading: isFetching } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!session?.accessToken && !!userId,
  });

  // Sync fetch data to form state
  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name,
        email: profileData.data.email
      });
    }
  }, [profileData]);

  // 2. Mutation for update
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await fetch(`/api/v1/users?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(updatedData)
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        setErrorMsg(data.message);
      } else {
        setSuccessMsg(data.message);
        queryClient.invalidateQueries(['userProfile', userId]);
        // Optional: redirect back to profile after delay
        setTimeout(() => router.push('/profile'), 2000);
      }
    },
    onError: () => {
      setErrorMsg('Data profile GAGAL diupdate');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    mutation.mutate(formData);
  };

  if (status === 'loading' || isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Authorization Check
  if (session?.user?.id?.toString() !== userId?.toString()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error">
          Anda tidak memiliki izin untuk mengedit profil ini.
        </Alert>
        <Button component={Link} href="/profile" sx={{ mt: 2 }}>
          Kembali ke Profil
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <IconButton component={Link} href="/profile" color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" align="center">
          Edit Profile
        </Typography>
        
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Alamat Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={mutation.isLoading}
              sx={{ borderRadius: 2, py: 1.5, mt: 2 }}
            >
              {mutation.isLoading ? <CircularProgress size={24} color="inherit" /> : 'Simpan Perubahan'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMsg('')}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
