import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Alert,
    Fade,
    useTheme,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const SIMULATION_WIDTH = 800; // Virtual meters (approx mapping to pixels)
const SIMULATION_HEIGHT = 400;
const DETECTION_RANGE = 200; // Meters

const AmbulanceSimulation = () => {
    const theme = useTheme();
    const [isEmergency, setIsEmergency] = useState(false);
    const [ambulancePos, setAmbulancePos] = useState({ x: 50, y: SIMULATION_HEIGHT / 2 });
    const [vehicles, setVehicles] = useState([]);
    const [logs, setLogs] = useState([]);
    const requestRef = useRef();

    // Initialize vehicles
    useEffect(() => {
        const initialVehicles = Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            x: 300 + i * 120, // Distributed ahead
            y: SIMULATION_HEIGHT / 2 + (Math.random() > 0.5 ? 40 : -40), // Two lanes
            speed: 2 + Math.random() * 2,
            alerted: false,
            movingAside: false,
            type: Math.random() > 0.5 ? 'car' : 'truck',
        }));
        setVehicles(initialVehicles);
    }, []);

    // Moving logic
    const animate = () => {
        setAmbulancePos((prev) => {
            let newX = prev.x + (isEmergency ? 4 : 2); // Ambulance moves faster in emergency
            if (newX > SIMULATION_WIDTH) newX = -50;
            return { ...prev, x: newX };
        });

        setVehicles((prevVehicles) =>
            prevVehicles.map((v) => {
                // Calculate distance from ambulance
                // Note: In this simple 1D-dominant flow, we mostly care about X distance being positive (vehicle is ahead)
                // But for "Range", we use Euclidean.
                const dx = v.x - ambulancePos.x;
                const dy = v.y - ambulancePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let newAlerted = v.alerted;
                let newMovingAside = v.movingAside;
                let newY = v.y;

                // Check range trigger
                if (isEmergency && distance < DETECTION_RANGE && dx > -50) { // Only alert if close and somewhat ahead or parallel
                    if (!newAlerted) {
                        addLog(`Vehicle #${v.id + 1} detected within ${Math.round(distance)}m. Sending alert...`);
                        newAlerted = true;
                        newMovingAside = true; // Trigger move aside
                    }
                } else if (!isEmergency) {
                    newAlerted = false;
                    newMovingAside = false;
                }

                // Move aside logic (simple Y shift)
                if (newMovingAside) {
                    const targetY = v.y > SIMULATION_HEIGHT / 2 ? SIMULATION_HEIGHT - 60 : 60; // Move to shoulders
                    if (Math.abs(v.y - targetY) > 1) {
                        newY = v.y + (targetY - v.y) * 0.1;
                    }
                } else {
                    // Return to lane if not emergency (optional, but good for reset)
                    const originalY = v.id % 2 === 0 ? SIMULATION_HEIGHT / 2 - 40 : SIMULATION_HEIGHT / 2 + 40;
                    // Only drift back slowly if out of range or emergency off
                    if (Math.abs(v.y - originalY) > 1 && !isEmergency) {
                        newY = v.y + (originalY - v.y) * 0.05;
                    }
                }

                let newX = v.x + v.speed;
                if (newX > SIMULATION_WIDTH) newX = -50;

                return { ...v, x: newX, y: newY, alerted: newAlerted, movingAside: newMovingAside };
            })
        );

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isEmergency, ambulancePos.x]); // Depend on relevant state if needed, but refs usually handle loops well.
    // Actually, to avoid stale stats, using functional updates in setVehicles and setAmbulancePos (already done).
    // But we need 'ambulancePos' inside setVehicles to calculation distance.
    // The closure might capture stale ambulancePos if we aren't careful.
    // Ideally, update everything in one go or use a ref for positions.
    // For simplicity in React, let's just re-bind the effect or use a ref for 'current' ambulance pos to read inside the vehicle loop.
    // FIX: Using a Ref to track ambulance pos for the vehicle loop to read without re-triggering effect constantly.

    const ambPosRef = useRef(ambulancePos);
    useEffect(() => { ambPosRef.current = ambulancePos; }, [ambulancePos]);

    useEffect(() => {
        // Re-implement the loop to be robust
        const loop = () => {

            // Update Ambulance
            let currentAmbX = 0;
            setAmbulancePos(prev => {
                let newX = prev.x + (isEmergency ? 3.5 : 1.5);
                if (newX > SIMULATION_WIDTH) newX = -100;
                currentAmbX = newX;
                return { ...prev, x: newX };
            });

            // Update Vehicles
            setVehicles(prev => prev.map(v => {
                const dx = v.x - currentAmbX;
                // Distance calculation
                const dist = Math.sqrt(dx * dx + (v.y - SIMULATION_HEIGHT / 2) ** 2); // Approx distance

                let shouldAlert = isEmergency && dist < DETECTION_RANGE && dx > -100; // Look ahead and slightly behind

                let targetY = v.id % 2 === 0 ? SIMULATION_HEIGHT / 2 - 40 : SIMULATION_HEIGHT / 2 + 40; // Default lanes
                if (shouldAlert) {
                    // Move to edges
                    targetY = v.y > SIMULATION_HEIGHT / 2 ? SIMULATION_HEIGHT - 50 : 50;
                }

                let newY = v.y + (targetY - v.y) * 0.05;
                let newX = v.x + v.speed;
                if (newX > SIMULATION_WIDTH) newX = -100;

                return { ...v, x: newX, y: newY, alerted: shouldAlert };
            }));

            requestRef.current = requestAnimationFrame(loop);
        }
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isEmergency]);


    const toggleEmergency = () => {
        setIsEmergency(!isEmergency);
        addLog(isEmergency ? 'Emergency Mode DEACTIVATED' : 'Emergency Mode ACTIVATED');
    };

    const addLog = (msg) => {
        setLogs((prev) => [{ time: new Date().toLocaleTimeString(), text: msg }, ...prev.slice(0, 4)]);
    };

    return (
        <Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #ef4444 30%, #f97316 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Ambulance Smart Alert System
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    V2X Simulation: Detecting emergency vehicles and triggering automated lane clearance.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Main Simulation View */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: SIMULATION_HEIGHT,
                            position: 'relative',
                            bgcolor: '#334155', // Asphalt color
                            overflow: 'hidden',
                            borderRadius: 4,
                            border: '2px solid',
                            borderColor: isEmergency ? 'error.main' : 'divider',
                            boxShadow: isEmergency ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Road Markings */}
                        <Box sx={{ position: 'absolute', top: '50%', width: '100%', height: 2, bgcolor: '#94a3b8', transform: 'translateY(-50%)', borderTop: '2px dashed #e2e8f0' }} />

                        {/* Range Indicator (Only visible in emergency) */}
                        {isEmergency && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: ambulancePos.x,
                                    top: ambulancePos.y,
                                    width: DETECTION_RANGE * 2,
                                    height: DETECTION_RANGE * 2,
                                    transform: 'translate(-50%, -50%)',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        {/* Vehicles */}
                        {vehicles.map((v) => (
                            <Box
                                key={v.id}
                                sx={{
                                    position: 'absolute',
                                    left: v.x,
                                    top: v.y,
                                    width: 60,
                                    height: 30,
                                    bgcolor: v.alerted ? '#fbbf24' : '#60a5fa',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transform: 'translate(-50%, -50%)',
                                    transition: 'background-color 0.3s',
                                    boxShadow: v.alerted ? '0 0 10px #fbbf24' : 'none',
                                    zIndex: 1,
                                }}
                            >
                                <DirectionsCarIcon sx={{ color: 'white', fontSize: 20 }} />
                                {v.alerted && (
                                    <WarningIcon sx={{ position: 'absolute', top: -20, color: '#fbbf24', animation: 'bounce 1s infinite' }} fontSize="small" />
                                )}
                            </Box>
                        ))}

                        {/* Ambulance */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: ambulancePos.x,
                                top: ambulancePos.y,
                                width: 70,
                                height: 35,
                                bgcolor: '#ef4444',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: isEmergency ? '0 0 30px #ef4444' : '0 4px 6px rgba(0,0,0,0.3)',
                                zIndex: 2,
                                border: '2px solid white'
                            }}
                        >
                            <MedicalServicesIcon sx={{ color: 'white' }} />
                            {/* Siren Lights */}
                            {isEmergency && (
                                <>
                                    <Box sx={{ position: 'absolute', top: -5, left: 5, width: 8, height: 8, borderRadius: '50%', bgcolor: 'blue', animation: 'ping 0.5s infinite' }} />
                                    <Box sx={{ position: 'absolute', top: -5, right: 5, width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', animation: 'ping 0.5s infinite 0.2s' }} />
                                </>
                            )}
                        </Box>

                    </Paper>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Running Simulation...</Typography>
                        <Box sx={{ width: 10, height: 10, bgcolor: 'green', borderRadius: '50%' }} />
                    </Box>
                </Grid>

                {/* Controls & Info */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Dashboard */}
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ambulance Control</Typography>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color={isEmergency ? "error" : "primary"}
                                    size="large"
                                    startIcon={isEmergency ? <VolumeOffIcon /> : <VolumeUpIcon />}
                                    onClick={toggleEmergency}
                                    sx={{
                                        py: 2,
                                        fontSize: '1.1rem',
                                        boxShadow: isEmergency ? '0 10px 20px rgba(239,68,68,0.3)' : undefined,
                                        animation: isEmergency ? 'pulse 1.5s infinite' : 'none'
                                    }}
                                >
                                    {isEmergency ? "STOP SIREN" : "TRIGGER EMERGENCY"}
                                </Button>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    Click to broadcast emergency signal to vehicles within {DETECTION_RANGE}m.
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Logs */}
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Alert Logs</Typography>
                                <Stack spacing={1}>
                                    {logs.length === 0 && <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>No alerts yet...</Typography>}
                                    {logs.map((log, i) => (
                                        <Fade in key={i}>
                                            <Alert severity={log.text.includes('DEACTIVATED') ? 'info' : 'warning'} variant="outlined" sx={{ py: 0 }}>
                                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{log.time}</Typography>
                                                {log.text}
                                            </Alert>
                                        </Fade>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            <style>
                {`
            @keyframes ping {
                0% { transform: scale(0.8); opacity: 0.8; }
                100% { transform: scale(2); opacity: 0; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `}
            </style>
        </Box>
    );
};

export default AmbulanceSimulation;
