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
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import TrafficIcon from '@mui/icons-material/Traffic';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './pages/Home';
import V2ISimulator from './pages/V2ISimulator';
import V2VSimulator from './pages/V2VSimulator';
import V2GSimulator from './pages/V2GSimulator';
// import Education from './pages/Education';
import About from './pages/About';
import Contact from './pages/Contact';

const drawerWidth = 260;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#3b82f6' },
      background: { default: darkMode ? '#0f172a' : '#f8fafc', paper: darkMode ? '#1e293b' : '#ffffff' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      body1: { fontSize: '1.05rem' },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 } } },
    },
  });

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'V2I Simulator', icon: <TrafficIcon />, path: '/v2i' },
    { text: 'V2V Simulator', icon: <TwoWheelerIcon />, path: '/v2v' },
    { text: 'V2G Simulator', icon: <ElectricBoltIcon />, path: '/v2g' },
    // { text: 'Education', icon: <SchoolIcon />, path: '/education' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactMailIcon />, path: '/contact' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          V2X Assistant
        </Typography>
      </Toolbar>
      <List sx={{ px: 1, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="primary" />}
          label="Dark Mode"
        />
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop permanent sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main content area */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
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
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                {navItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
              </Typography>
            </Toolbar>
          </AppBar>

          <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} /> {/* Spacer for mobile AppBar */}
          <Box sx={{ mt: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/v2i" element={<V2ISimulator />} />
              <Route path="/v2v" element={<V2VSimulator />} />
              <Route path="/v2g" element={<V2GSimulator />} />
              {/* <Route path="/education" element={<Education />} /> */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;