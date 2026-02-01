import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API/network delay (in real app → replace with actual fetch/axios)
    setTimeout(() => {
      console.log('Contact form submitted:', form);
      setLoading(false);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4, md: 6 },
        borderRadius: 0, // sharp edges to match your request
        bgcolor: 'background.paper',
        minHeight: '70vh',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        fontWeight={700}
        gutterBottom
        sx={{ color: 'primary.main', mb: 1.5 }}
      >
        Get in Touch
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ mb: 5, maxWidth: 760 }}
      >
        Have questions about V2X, the simulators, collaboration opportunities, or feedback?  
        Drop us a message — we’d love to hear from you.
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 0, // sharp corners
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.light' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  '&.Mui-focused': { color: 'primary.main' },
                },
              }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 0,
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.light' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  '&.Mui-focused': { color: 'primary.main' },
                },
              }}
            />
          </Grid>

          {/* Message */}
          <Grid item xs={12}>
            <TextField
              label="Your Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              multiline
              rows={6}
              fullWidth
              required
              variant="outlined"
              size="medium"
              InputProps={{
                sx: {
                  borderRadius: 0,
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.light' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  '&.Mui-focused': { color: 'primary.main' },
                },
              }}
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                endIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />
                }
                sx={{
                  px: 7,
                  py: 1.6,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)',
                  },
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </form>

      {/* Success feedback */}
      <Snackbar
        open={submitted}
        autoHideDuration={6000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 0,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onClose={() => setSubmitted(false)}
        >
          Thank you! Your message has been sent successfully.
        </Alert>
      </Snackbar>
    </Paper>
  );
}