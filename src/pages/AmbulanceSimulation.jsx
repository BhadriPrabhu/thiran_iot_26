import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Divider,
  Alert,
  Fade,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { motion } from 'framer-motion';

const SIMULATION_WIDTH = 1200;
const SIMULATION_HEIGHT = 300;
const DETECTION_RANGE = 220;
const BUFFER = 200;

const AmbulanceSimulation = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [ambulancePos, setAmbulancePos] = useState({ 
    x: 80, 
    y: SIMULATION_HEIGHT / 2,
    teleporting: false 
  });
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const animationRef = useRef();

  // Initialize vehicles with extra spacing to prevent immediate overlaps
  useEffect(() => {
    const initialVehicles = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: 300 + i * 200,
      y: SIMULATION_HEIGHT / 2 + (i % 2 === 0 ? 45 : -45),
      speed: 1.6 + Math.random() * 0.8,
      baseSpeed: 1.6 + Math.random() * 0.8,
      alerted: false,
      movingAside: false,
      type: Math.random() > 0.5 ? 'car' : 'truck',
      teleporting: false,
    }));
    setVehicles(initialVehicles);
  }, []);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;

    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Move Ambulance with Teleport Logic
      setAmbulancePos((prev) => {
        let newX = prev.x + (isEmergency ? 320 : 110) * delta;
        let isTeleporting = false;

        if (newX > SIMULATION_WIDTH + BUFFER) {
          newX = -BUFFER;
          isTeleporting = true;
        }
        return { ...prev, x: newX, teleporting: isTeleporting };
      });

      // 2. Move Vehicles with Collision Avoidance and Teleport Logic
      setVehicles((prevVehicles) => {
        // Sort vehicles by X to determine "who is in front"
        const sorted = [...prevVehicles].sort((a, b) => b.x - a.x);

        return prevVehicles.map((v) => {
          const dx = v.x - ambulancePos.x;
          const dy = v.y - ambulancePos.y;
          const distance = Math.hypot(dx, dy);

          let alerted = v.alerted;
          let movingAside = v.movingAside;
          let newY = v.y;
          let isTeleporting = false;

          // V2X Detection
          if (isEmergency && distance < DETECTION_RANGE && dx > -80) {
            if (!alerted) {
              addLog(`Vehicle #${v.id + 1} (${v.type}) yielding to emergency`);
            }
            alerted = true;
            movingAside = true;
          } else if (!isEmergency) {
            alerted = false;
            movingAside = false;
          }

          // Lane Logic (Clearance)
          if (movingAside) {
            const targetY = v.y > SIMULATION_HEIGHT / 2 ? SIMULATION_HEIGHT - 45 : 45;
            newY += (targetY - newY) * 0.15; // Faster reaction
          } else {
            const laneY = v.id % 2 === 0 ? SIMULATION_HEIGHT / 2 + 40 : SIMULATION_HEIGHT / 2 - 40;
            newY += (laneY - newY) * 0.05;
          }

          // Collision Avoidance Logic (Look ahead)
          const carAhead = sorted.find(other => 
            other.x > v.x && 
            Math.abs(other.y - v.y) < 30 && 
            other.x - v.x < 150
          );
          
          let currentSpeed = v.baseSpeed;
          if (carAhead) {
            currentSpeed = Math.min(v.baseSpeed, carAhead.speed * 0.9);
          }

          let newX = v.x + (currentSpeed * 60 * delta);

          // Reset/Teleport Logic
          if (newX > SIMULATION_WIDTH + BUFFER) {
            newX = -BUFFER;
            isTeleporting = true;
            alerted = false;
            movingAside = false;
          }

          return { ...v, x: newX, y: newY, alerted, movingAside, speed: currentSpeed, teleporting: isTeleporting };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isEmergency, ambulancePos.x]);

  const addLog = (msg) => {
    setLogs((prev) => [{ time: new Date().toLocaleTimeString(), text: msg }, ...prev.slice(0, 6)]);
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
      <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
        Ambulance Priority Alert System
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
        V2X-powered simulation: detects emergency vehicles and triggers automatic lane clearance.
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 }, mb: 5 }}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            height: SIMULATION_HEIGHT,
            bgcolor: '#1e293b',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isEmergency ? 'error.main' : 'divider',
            boxShadow: isEmergency ? '0 0 40px rgba(239, 68, 68, 0.35)' : '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'border-color 0.4s ease',
          }}
        >
          {/* Road background */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(90deg, #334155 0px, #334155 80px, #475569 80px, #475569 160px)',
            }}
          />

          {/* Detection range */}
          {isEmergency && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: ambulancePos.x,
                top: ambulancePos.y,
                width: DETECTION_RANGE * 2,
                height: DETECTION_RANGE * 2,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '2px dashed rgba(239, 68, 68, 0.6)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          {/* Vehicles */}
          {vehicles.map((v) => (
            <motion.div
              key={v.id}
              animate={{ x: v.x, y: v.y }}
              transition={v.teleporting ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
              style={{
                position: 'absolute',
                width: v.type === 'truck' ? 80 : 60,
                height: v.type === 'truck' ? 40 : 30,
                background: v.alerted ? '#fbbf24' : '#60a5fa',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: v.alerted ? '0 0 20px #fbbf24' : '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10,
              }}
            >
              <DirectionsCarIcon sx={{ color: 'white', fontSize: v.type === 'truck' ? 28 : 22 }} />
              {v.alerted && (
                <WarningIcon
                  sx={{
                    position: 'absolute',
                    top: -18,
                    color: '#fbbf24',
                    animation: 'pulse 1.2s infinite',
                    fontSize: 20,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Ambulance */}
          <motion.div
            animate={{ x: ambulancePos.x, y: ambulancePos.y }}
            transition={ambulancePos.teleporting ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 15 }}
            style={{
              position: 'absolute',
              width: 90,
              height: 45,
              background: '#ef4444',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isEmergency ? '0 0 40px #ef4444' : '0 6px 20px rgba(0,0,0,0.4)',
              zIndex: 20,
              border: '3px solid white',
            }}
          >
            <MedicalServicesIcon sx={{ color: 'white', fontSize: 36 }} />
            {isEmergency && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#60a5fa',
                    top: 6,
                    left: 12,
                    animation: 'ping 1.2s infinite',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    top: 6,
                    right: 12,
                    animation: 'ping 1.2s infinite 0.4s',
                  }}
                />
              </>
            )}
          </motion.div>
        </Paper>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, mb: { xs: 4, md: 0 } }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Emergency Control
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="contained"
                  size="large"
                  color={isEmergency ? 'error' : 'primary'}
                  startIcon={isEmergency ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  onClick={() => setIsEmergency(!isEmergency)}
                  fullWidth
                  sx={{ minWidth: 220 }}
                >
                  {isEmergency ? 'Disable Siren' : 'Activate Emergency'}
                </Button>
              </motion.div>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Real-time Alert Log
            </Typography>
            <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 4, textAlign: 'center' }}>
                  No alerts yet. Activate emergency to start.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {logs.map((log, i) => (
                    <Fade in key={i} timeout={600}>
                      <Alert severity={log.text.includes('Yielding') ? 'warning' : 'info'} variant="outlined">
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {log.time}
                        </Typography>
                        {log.text}
                      </Alert>
                    </Fade>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes ping {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          }
        `}
      </style>
    </Paper>
  );
};

export default AmbulanceSimulation;