import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      icon: <DirectionsCarIcon fontSize="large" color="primary" />,
      title: 'V2X Simulation',
      description:
        'Real-time interactive simulators for V2I, V2V, and V2G to explore connected vehicle behavior.',
    },
    {
      icon: <BoltIcon fontSize="large" color="primary" />,
      title: 'Energy Optimization',
      description:
        'Visualize how V2X eliminates stop-and-go waste and enables intelligent energy management.',
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Safety Enhancement',
      description:
        'Demonstrate real-time collision avoidance and awareness through vehicle-to-everything communication.',
    },
  ];

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
        Welcome to Green Wave Assistant
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ mb: 5, maxWidth: 800 }}
      >
        A next-generation simulation platform built to showcase how Vehicle-to-Everything (V2X) communication
        dramatically improves safety, extends electric vehicle range, and optimizes energy usage.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: { xs: '100%', sm: '340px', md: '400px' },
                    width: '100%',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
          Start exploring V2X today
        </Typography>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="/v2i"
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
            }}
          >
            Launch V2I Simulator
          </Button>
        </motion.div>
      </Box>
    </Paper>
  );
}