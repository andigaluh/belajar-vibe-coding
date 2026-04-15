'use client';

import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const drawerWidth = 240;

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header onDrawerToggle={handleDrawerToggle} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
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
