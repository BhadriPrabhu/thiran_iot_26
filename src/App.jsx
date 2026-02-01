import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import TrafficIcon from '@mui/icons-material/Traffic';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Pages
import Home from './pages/Home';
import AmbulanceSimulation from './pages/AmbulanceSimulation';
import V2ISimulator from './pages/V2ISimulator';
import V2VSimulator from './pages/V2VSimulator';
import V2GSimulator from './pages/V2GSimulator';
import About from './pages/About';
import Contact from './pages/Contact';

const drawerWidth = 260;

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#3b82f6' },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      divider: darkMode ? '#334155' : '#e2e8f0',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: { fontWeight: 700 },
      body1: { fontSize: '1.05rem' },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)', // keep shadow, remove radius
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            // no border radius here
          },
        },
      },
    },
  });

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Ambulance Simulation', icon: <MedicalServicesIcon />, path: '/ambulance' },
    { text: 'V2I Simulator', icon: <TrafficIcon />, path: '/v2i' },
    { text: 'V2V Simulator', icon: <TwoWheelerIcon />, path: '/v2v' },
    { text: 'V2G Simulator', icon: <ElectricBoltIcon />, path: '/v2g' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactMailIcon />, path: '/contact' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          V2X Assistant
        </Typography>
      </Toolbar>

      <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                  borderRadius: "10px"
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="primary"
            />
          }
          label="Dark Mode"
          labelPlacement="start"
          sx={{ ml: 0, width: '100%', justifyContent: 'space-between' }}
        />
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              {navItems.find((item) => item.path === location.pathname)?.text || 'V2X Dashboard'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* Page content wrapper */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4, lg: 5 },
            maxWidth: 1440,
            mx: 'auto',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ambulance" element={<AmbulanceSimulation />} />
            <Route path="/v2i" element={<V2ISimulator />} />
            <Route path="/v2v" element={<V2VSimulator />} />
            <Route path="/v2g" element={<V2GSimulator />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}