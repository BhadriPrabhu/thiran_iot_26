import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import BuildIcon from '@mui/icons-material/Build';

export default function About() {
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
        About Green Wave Assistant
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ mb: 5, maxWidth: 800 }}
      >
        A simulation-first platform created for EVathon to demonstrate the real-world impact of V2X
        (Vehicle-to-Everything) technologies on electric vehicle efficiency, safety, and grid integration.
      </Typography>

      <Grid container spacing={5}>
        {/* Left column – Goal & Capabilities */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Project Objective
          </Typography>
          <Typography paragraph sx={{ mb: 4 }}>
            This application illustrates how real-time V2X communication — including Vehicle-to-Infrastructure (V2I),
            Vehicle-to-Vehicle (V2V), and Vehicle-to-Grid (V2G) — can significantly reduce energy consumption,
            prevent stop-and-go inefficiencies, enable smart energy trading, and enhance overall road safety.
          </Typography>

          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Core Capabilities
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ElectricCarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Interactive real-time V2I, V2V, and V2G simulators"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>

            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <TimelineIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Visual tracking of energy savings and efficiency gains"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>

            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CodeIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Export simulation data as CSV for analysis"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>

            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BuildIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Responsive design with dark mode support"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
          </List>
        </Grid>

        {/* Right column – Roadmap */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Future Development Roadmap
          </Typography>

          <Typography paragraph sx={{ mb: 2, fontWeight: 500 }}>
            Planned enhancements include:
          </Typography>

          <List dense disablePadding sx={{ pl: 2 }}>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="• Integration with real hardware (ESP32/Arduino for live V2X messaging)"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="• Advanced multi-vehicle platooning visualization"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="• Predictive energy optimization using simulation history"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="• Cloud-based result sharing and team comparison"
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Developed for EVathon • 2025–2026
        </Typography>
      </Box>
    </Paper>
  );
}