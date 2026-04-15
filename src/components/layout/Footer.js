import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="/">
            My App
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
        <Stack
          spacing={2}
          sx={{ mt: 1, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}
        >
          <Link href="https://instagram.com" color="inherit">
            <InstagramIcon />
          </Link>
          <Link href="https://twitter.com" color="inherit">
            <TwitterIcon />
          </Link>
          <Link href="https://github.com" color="inherit">
            <GitHubIcon />
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
