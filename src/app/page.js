import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Hello World!
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom color="textSecondary">
            Next.js + Material UI + TanStack Query + Next-Auth 
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button variant="contained" size="large" sx={{ mr: 2 }}>
              Get Started
            </Button>
            <Button variant="outlined" size="large">
              Documentation
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}


