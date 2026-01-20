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
import Simulator2D from '../components/Simulator2D';   // ← make sure this path is correct
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function V2ISimulator() {
  const [lightStatus, setLightStatus] = useState('green');
  const [lightCountdown, setLightCountdown] = useState(10);
  const [carSpeed, setCarSpeed] = useState(50);
  const [carPosition, setCarPosition] = useState(0);
  const [distanceToLight, setDistanceToLight] = useState(200);
  const [advice, setAdvice] = useState('Maintain Speed');
  const [energySaved, setEnergySaved] = useState(0);
  const [energyHistory, setEnergyHistory] = useState([0]);
  const [isRunning, setIsRunning] = useState(false);

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
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        bgcolor: 'background.paper',
        minHeight: '70vh',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
        V2I – Green Wave / Traffic Light Optimization
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Adjust speed to pass the light on green and avoid unnecessary stops.
      </Typography>

      {/* Visualization */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 } }}>
        <Simulator2D
          carPosition={carPosition}
          distanceToLight={distanceToLight}
          lightStatus={lightStatus}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Controls */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Vehicle Speed (km/h)
          </Typography>
          <Slider
            value={carSpeed}
            onChange={(_, v) => setCarSpeed(v)}
            min={20}
            max={80}
            step={5}
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
            min={100}
            max={500}
            step={25}
            valueLabelDisplay="auto"
            marks
          />
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 4, mb: 5 }}
        justifyContent="center"
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="contained"
            size="large"
            color={isRunning ? 'warning' : 'primary'}
            onClick={() => setIsRunning(!isRunning)}
            fullWidth
            sx={{ minWidth: 160 }}
          >
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setCarPosition(0);
              setEnergySaved(0);
              setEnergyHistory([0]);
              setAdvice('Maintain Speed');
              setLightStatus('green');
              setLightCountdown(10);
            }}
            fullWidth
            sx={{ minWidth: 160 }}
          >
            Reset
          </Button>
        </motion.div>

        <Tooltip title="Export data as CSV">
          <IconButton
            color="primary"
            size="large"
            onClick={exportData}
            sx={{ alignSelf: { xs: 'center', sm: 'flex-start' } }}
          >
            <DownloadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Status & Metrics */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 5 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Current Recommendation
        </Typography>
        <Typography
          variant="h6"
          color={advice.includes('Reduce') || advice.includes('Stopped') ? 'error' : 'success'}
          sx={{ mb: 3 }}
        >
          {advice}
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <CircularProgress
              variant="determinate"
              value={Math.min(100, energySaved * 2)}
              color="success"
              size={80}
              thickness={5}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="body1">
              Energy Efficiency Gain
              <br />
              <strong style={{ fontSize: '1.5rem' }}>{energySaved.toFixed(1)} %</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Typography variant="body2" color="text.secondary">
              Position: {Math.round(carPosition)} / {distanceToLight} m
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Chart */}
      <Box sx={{ height: 380 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Energy Efficiency Trend', font: { size: 16 } },
              legend: { position: 'top' },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Efficiency Gain (%)' } },
              x: { title: { display: true, text: 'Time (seconds)' } },
            },
          }}
        />
      </Box>
    </Paper>
  );
}