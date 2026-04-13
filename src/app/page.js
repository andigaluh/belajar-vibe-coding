import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { auth, signOut } from "@/auth";
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}
      >
        {session?.user ? (
          <>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Hi, {session.user.name || session.user.email}
            </Typography>
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <Button 
                type="submit" 
                variant="outlined" 
                color="error"
                size="small"
              >
                Logout
              </Button>
            </form>
          </>
        ) : (
          <Button 
            href="/login" 
            variant="contained" 
            color="primary"
            size="small"
          >
            Login
          </Button>
        )}
      </Box>

      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
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
    </>
  );
}

