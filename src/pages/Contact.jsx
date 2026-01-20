import React from 'react';
import { Typography, TextField, Button, Paper } from '@mui/material';

export default function Contact() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5">Contact Us</Typography>
      <TextField label="Name" fullWidth sx={{ mt: 2 }} />
      <TextField label="Email" fullWidth sx={{ mt: 2 }} />
      <TextField label="Message" multiline rows={4} fullWidth sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2 }}>Submit</Button>
    </Paper>
  );
}