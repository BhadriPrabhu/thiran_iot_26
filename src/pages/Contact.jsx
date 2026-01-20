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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production → send to backend / Formspree / EmailJS
    console.log('Contact form submitted:', form);
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
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
        sx={{ color: 'primary.main', mb: 2 }}
      >
        Contact Us
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ mb: 5, maxWidth: 800 }}
      >
        Have questions about V2X technologies, simulation results, potential collaboration, or feedback?
        We’d be happy to connect — drop us a message.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Your Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              multiline
              rows={5}
              fullWidth
              required
              variant="outlined"
              size="medium"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<SendIcon />}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                Send Message
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={submitted}
        autoHideDuration={5000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
          onClose={() => setSubmitted(false)}
        >
          Thank you! Your message has been sent successfully.
        </Alert>
      </Snackbar>
    </Paper>
  );
}