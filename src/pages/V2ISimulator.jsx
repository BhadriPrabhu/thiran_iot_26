import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import Simulator2D from '../components/Simulator2D'; 
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function V2ISimulator() {
  // Original V2I States
  const [lightStatus, setLightStatus] = useState('green');
  const [lightCountdown, setLightCountdown] = useState(10);
  const [carSpeed, setCarSpeed] = useState(50);
  const [carPosition, setCarPosition] = useState(0);
  const [distanceToLight, setDistanceToLight] = useState(200);
  const [advice, setAdvice] = useState('Maintain Speed');
  const [energySaved, setEnergySaved] = useState(0);
  const [energyHistory, setEnergyHistory] = useState([0]);

  // New Speed Management States
  const [smLightStatus, setSmLightStatus] = useState('red');
  const [smLightCountdown, setSmLightCountdown] = useState(8);
  const [smCarSpeed, setSmCarSpeed] = useState(60);
  const [smCarPosition, setSmCarPosition] = useState(0);
  const [smDistanceToLight, setSmDistanceToLight] = useState(250);
  const [smAdvice, setSmAdvice] = useState('Maintain Speed');
  const [smEnergySaved, setSmEnergySaved] = useState(0);
  const [smEnergyHistory, setSmEnergyHistory] = useState([0]);

  const [isRunning, setIsRunning] = useState(false);

  // Original V2I Loop
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setLightCountdown((prev) => {
        if (prev <= 1) {
          if (lightStatus === 'green') {
            setLightStatus('yellow');
            return 3;
          }
          if (lightStatus === 'yellow') {
            setLightStatus('red');
            return 10;
          }
          setLightStatus('green');
          return 10;
        }
        return prev - 1;
      });

      setCarPosition((prev) => {
        const newPos = prev + carSpeed / 3.6;
        if (newPos >= distanceToLight) {
          if (lightStatus === 'green') {
            setEnergySaved((p) => p + 5);
            setAdvice('Passed Successfully');
            return 0;
          } else {
            setAdvice('Stopped at Signal');
            setEnergySaved((p) => Math.max(0, p - 2));
            return distanceToLight;
          }
        }
        return newPos;
      });

      const timeToLight = (distanceToLight - carPosition) / (carSpeed / 3.6);
      setAdvice(
        timeToLight > lightCountdown && lightStatus !== 'red'
          ? 'Reduce Speed'
          : 'Maintain Speed'
      );

      setEnergyHistory((prev) => [...prev, energySaved]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, lightStatus, lightCountdown, carSpeed, carPosition, distanceToLight, energySaved]);

  // Speed Management Loop
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSmLightCountdown((prev) => {
        if (prev <= 1) {
          if (smLightStatus === 'green') {
            setSmLightStatus('yellow');
            return 3;
          }
          if (smLightStatus === 'yellow') {
            setSmLightStatus('red');
            return 10;
          }
          setSmLightStatus('green');
          return 10;
        }
        return prev - 1;
      });

      setSmCarPosition((prev) => {
        let newSpeed = smCarSpeed;
        const timeToLight = (smDistanceToLight - prev) / (smCarSpeed / 3.6);
        if (timeToLight < smLightCountdown + 5 && smLightStatus === 'red') {
          newSpeed = Math.max(20, smCarSpeed - 10);
          setSmAdvice('Slowing for Red Light');
          setSmEnergySaved((p) => p + 2);
        } else {
          setSmAdvice('Maintain Speed');
        }
        setSmCarSpeed(newSpeed);

        const newPos = prev + newSpeed / 3.6;
        if (newPos >= smDistanceToLight) {
          if (smLightStatus === 'green') {
            setSmEnergySaved((p) => p + 5);
            setSmAdvice('Passed Successfully');
            return 0;
          } else {
            setSmAdvice('Stopped at Signal');
            setSmEnergySaved((p) => Math.max(0, p - 2));
            return smDistanceToLight;
          }
        }
        return newPos;
      });

      setSmEnergyHistory((prev) => [...prev, smEnergySaved]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, smLightStatus, smLightCountdown, smCarSpeed, smCarPosition, smDistanceToLight, smEnergySaved]);

  const chartData = {
    labels: energyHistory.map((_, i) => i),
    datasets: [{
      label: 'Energy Efficiency Gain (%)',
      data: energyHistory,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.3,
    }],
  };

  const smChartData = {
    labels: smEnergyHistory.map((_, i) => i),
    datasets: [{
      label: 'Energy Efficiency Gain (%)',
      data: smEnergyHistory,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.3,
    }],
  };

  const exportData = () => {
    const csv = Papa.unparse(energyHistory.map((v, i) => ({ Time: i, 'Energy Saved': v.toFixed(1) })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'v2i_simulation.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        bgcolor: 'background.paper',
        minHeight: '70vh',
        border: 1,
        borderColor: 'divider',
        maxWidth: '1600px', // Increased max-width for laptop screens
        margin: '0 auto'
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          V2I - Green Wave / Traffic Light Optimization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Adjust speed to pass the light on green and avoid unnecessary stops.
        </Typography>
      </Box>

      {/* Main Simulation Grid */}
      <Grid container spacing={3} justifyContent="center">
        {/* Standard V2I Card */}
        <Grid item xs={12} lg={6}> 
          <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom align="center">
              Standard V2I Simulation
            </Typography>
            
            <Box sx={{ mb: 3, width: '100%' }}>
              <Simulator2D
                carPosition={carPosition}
                distanceToLight={distanceToLight}
                lightStatus={lightStatus}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                 <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>POSITION</Typography>
                    <Typography variant="h6">{Math.round(carPosition)}m / {distanceToLight}m</Typography>
                 </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                 <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>ADVICE</Typography>
                    <Typography variant="h6" color={advice.includes('Reduce') ? 'error' : 'success'}>{advice}</Typography>
                 </Paper>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3, px: 2 }}>
               <CircularProgress
                  variant="determinate"
                  value={Math.min(100, energySaved * 2)}
                  color="success"
                  size={50}
                  thickness={5}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">Efficiency Gain</Typography>
                  <Typography variant="h6" fontWeight={700}>{energySaved.toFixed(1)} %</Typography>
                </Box>
            </Stack>

            <Box sx={{ height: 250 }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Speed Management Card */}
        <Grid item xs={12} lg={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom align="center">
              Speed Management V2I Simulation
            </Typography>
            
            <Box sx={{ mb: 3, width: '100%' }}>
              <Simulator2D
                carPosition={smCarPosition}
                distanceToLight={smDistanceToLight}
                lightStatus={smLightStatus}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                 <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>POSITION</Typography>
                    <Typography variant="h6">{Math.round(smCarPosition)}m / {smDistanceToLight}m</Typography>
                 </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                 <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>ADVICE</Typography>
                    <Typography variant="h6" color={smAdvice.includes('Slowing') ? 'warning.main' : 'success'}>{smAdvice}</Typography>
                 </Paper>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3, px: 2 }}>
               <CircularProgress
                  variant="determinate"
                  value={Math.min(100, smEnergySaved * 2)}
                  color="success"
                  size={50}
                  thickness={5}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">Efficiency Gain</Typography>
                  <Typography variant="h6" fontWeight={700}>{smEnergySaved.toFixed(1)} %</Typography>
                </Box>
            </Stack>

            <Box sx={{ height: 250 }}>
              <Line
                data={smChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Controls Section */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Vehicle Speed (km/h)
            </Typography>
            <Slider
              value={carSpeed}
              onChange={(_, v) => setCarSpeed(v)}
              min={20} max={80} step={5}
              valueLabelDisplay="auto"
              marks
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Distance to Light (m)
            </Typography>
            <Slider
              value={distanceToLight}
              onChange={(_, v) => setDistanceToLight(v)}
              min={100} max={500} step={25}
              valueLabelDisplay="auto"
              marks
            />
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 4 }}
          justifyContent="center"
          alignItems="center"
        >
          <motion.div style={{ width: '100%', maxWidth: 200 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              size="large"
              color={isRunning ? 'warning' : 'primary'}
              onClick={() => setIsRunning(!isRunning)}
              fullWidth
            >
              {isRunning ? 'Pause' : 'Start Simulation'}
            </Button>
          </motion.div>

          <motion.div style={{ width: '100%', maxWidth: 200 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setCarPosition(0); setEnergySaved(0); setEnergyHistory([0]);
                setAdvice('Maintain Speed'); setLightStatus('green'); setLightCountdown(10);
                setSmCarPosition(0); setSmEnergySaved(0); setSmEnergyHistory([0]);
                setSmAdvice('Maintain Speed'); setSmLightStatus('red'); setSmLightCountdown(8);
                setSmCarSpeed(60);
              }}
              fullWidth
            >
              Reset
            </Button>
          </motion.div>

          <Tooltip title="Export data as CSV">
            <IconButton color="primary" onClick={exportData}>
              <DownloadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}