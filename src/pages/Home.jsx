import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function Home() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4">Welcome to Green Wave Assistant</Typography>
      <Typography paragraph>
        This advanced web application simulates V2X technologies for electric vehicles, demonstrating improvements in safety and energy efficiency.
      </Typography>
      <Typography paragraph>
        Navigate using the sidebar to explore simulators, educational content, and more.
      </Typography>
    </Paper>
  );
}