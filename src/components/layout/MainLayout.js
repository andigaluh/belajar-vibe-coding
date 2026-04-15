'use client';

import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const hasSession = !!session?.user;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header onDrawerToggle={handleDrawerToggle} />
      
      <Box sx={{ display: 'flex', flexGrow: 1, width: '100%' }}>
        {/* Sidebar - only show if logged in */}
        {hasSession && (
          <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { 
              xs: '100%', 
              sm: hasSession ? '80%' : '100%' 
            },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar /> {/* Top spacer to offset fixed header */}
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
          
          {/* Footer inside main area to allow it to push down */}
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

