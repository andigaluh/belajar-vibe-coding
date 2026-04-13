'use client';

import React, { Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = React.useState(null);

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        redirect: false,
        callbackUrl: callbackUrl,
      });
      return result;
    },
    onSuccess: (result) => {
      console.log(result)
      if (result?.error) {
        setError('Email or password is wrong');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    },
    onError: (err) => {
      console.error('Login submit error:', err);
      setError('Something went wrong. Please try again later.');
    }
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setError(null);
      loginMutation.mutate(values);
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Login
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Welcome back! Please enter your details.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />

            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link href="/forget-password" passHref legacyBehavior>
                <MuiLink variant="body2" sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                  Forgot password?
                </MuiLink>
              </Link>
            </Box>

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ py: 1.5, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
            >
              {loginMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/register" passHref legacyBehavior>
                  <MuiLink fontWeight="bold" sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                    Register
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    }>
      <LoginContent />
    </Suspense>
  );
}
