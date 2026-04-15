'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header({ onDrawerToggle }) {
  const { data: session } = useSession();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {session?.user && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          My App
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session?.user ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                Hi, {session.user.name || session.user.email}
              </Typography>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              component={Link} 
              href="/login" 
              variant="contained" 
              color="secondary" 
              size="small"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
