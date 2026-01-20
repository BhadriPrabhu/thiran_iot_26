import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function About() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5">About the Project</Typography>
      <Typography paragraph>
        Developed for EVathon to showcase V2X impacts on EV efficiency. Built with React, MUI, and Three.js.
      </Typography>
      <Typography paragraph>
        Future extensions: Real hardware integration with Arduino/ESP32.
      </Typography>
    </Paper>
  );
}