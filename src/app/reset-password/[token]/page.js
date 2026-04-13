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
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token;
  const [feedback, setFeedback] = useState({ message: '', severity: 'info', open: false });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch('/api/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
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
      formik.resetForm();
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
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
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
            Reset Password
          </Typography>

          {feedback.open && (
            <Box sx={{ mb: 3 }}>
              <Alert severity={feedback.severity} sx={{ mb: 2 }}>
                {feedback.message}
              </Alert>
              {feedback.severity === 'success' && (
                <Typography align="center">
                  <MuiLink component={NextLink} href="/login">
                    Kembali ke halaman Login
                  </MuiLink>
                </Typography>
              )}
            </Box>
          )}

          {!feedback.open || feedback.severity !== 'success' ? (
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="New Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
              />
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
              </Button>
            </form>
          ) : null}
        </Paper>
      </Box>
    </Container>
  );
}
