'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';

export default function ForgetPasswordPage() {
  const [feedback, setFeedback] = useState({ message: '', severity: 'info', open: false });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch('/api/v1/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    },
    onSuccess: (data) => {
      setFeedback({
        message: data.message,
        severity: 'success',
        open: true,
      });
    },
    onError: (error) => {
      setFeedback({
        message: error.message,
        severity: 'error',
        open: true,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
            Lupa Password
          </Typography>

          {feedback.open && (
            <Alert severity={feedback.severity} sx={{ mb: 3 }}>
              {feedback.message}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={mutation.isPending}
              sx={{ mt: 3, height: 48 }}
            >
              {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Kirim Link Reset'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
