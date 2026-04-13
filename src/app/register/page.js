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

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function RegisterPage() {
  const [feedback, setFeedback] = useState({ message: '', severity: 'info', open: false });

  // TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
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
        message: data.message || 'User created successfully!',
        severity: 'success',
        open: true,
      });
      formik.resetForm();
    },
    onError: (error) => {
      setFeedback({
        message: error.message || 'Registration failed',
        severity: 'error',
        open: true,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
            Register
          </Typography>

          {feedback.open && (
            <Alert severity={feedback.severity} sx={{ mb: 3 }}>
              {feedback.message}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
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
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
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
              label="Confirm Password"
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
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
