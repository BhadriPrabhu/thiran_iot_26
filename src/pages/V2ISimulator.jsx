import React, { useState, useEffect } from 'react';
import { Typography, Paper, Slider, Button, Grid, CircularProgress, Tooltip, IconButton } from '@mui/material';
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
import Simulator2D from '../components/Simulator3D.jsx';
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
        if (prev > 1) return prev - 1;
        if (lightStatus === 'green') {
          setLightStatus('yellow');
          return 3;
        } else if (lightStatus === 'yellow') {
          setLightStatus('red');
          return 10;
        } else {
          setLightStatus('green');
          return 10;
        }
      });

      setCarPosition((prev) => {
        const newPos = prev + (carSpeed / 3.6);
        if (newPos >= distanceToLight) {
          if (lightStatus === 'green') {
            setEnergySaved((prev) => prev + 5);
            setAdvice('Passed Successfully');
            return 0;
          } else {
            setAdvice('Stopped at Signal');
            setEnergySaved((prev) => Math.max(0, prev - 2));
            return distanceToLight;
          }
        }
        return newPos;
      });

      const timeToLight = (distanceToLight - carPosition) / (carSpeed / 3.6);
      if (timeToLight > lightCountdown && lightStatus !== 'red') {
        setAdvice('Reduce Speed');
      } else {
        setAdvice('Maintain Speed');
      }

      setEnergyHistory((prev) => [...prev, energySaved]);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, lightStatus, lightCountdown, carSpeed, carPosition, distanceToLight, energySaved]);

  const chartData = {
    labels: energyHistory.map((_, i) => i),
    datasets: [{
      label: 'Energy Efficiency (%)',
      data: energyHistory,
      borderColor: '#1976d2',
      fill: true,
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
    }],
  };

  const exportData = () => {
    const csvData = energyHistory.map((val, i) => ({ Time: i, EnergySaved: val }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'v2i_simulation.csv';
    link.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        V2I Simulator: Advanced Traffic Optimization
      </Typography>
      <Simulator2D carPosition={carPosition} distanceToLight={distanceToLight} lightStatus={lightStatus} />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Tooltip title="Adjust vehicle speed for optimization">
            <div>
              <Typography gutterBottom>Speed (km/h)</Typography>
              <Slider value={carSpeed} onChange={(_, v) => setCarSpeed(v)} min={20} max={80} valueLabelDisplay="auto" />
            </div>
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={6}>
          <Tooltip title="Set initial distance to traffic signal">
            <div>
              <Typography gutterBottom>Distance to Signal (m)</Typography>
              <Slider value={distanceToLight} onChange={(_, v) => setDistanceToLight(v)} min={100} max={500} valueLabelDisplay="auto" />
            </div>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" color="primary" onClick={() => setIsRunning(!isRunning)} sx={{ mr: 2, px: 4 }}>
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outlined" onClick={() => {
              setCarPosition(0);
              setEnergySaved(0);
              setEnergyHistory([0]);
              setAdvice('Maintain Speed');
              setLightStatus('green');
              setLightCountdown(10);
            }} sx={{ mr: 2, px: 4 }}>
              Reset
            </Button>
          </motion.div>
          <Tooltip title="Export simulation data as CSV">
            <IconButton onClick={exportData} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>Recommendation: <strong>{advice}</strong></Typography>
      </motion.div>
      <Typography variant="body1">Position: {Math.round(carPosition)} m / {distanceToLight} m</Typography>
      <Grid container alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Grid item>
          <CircularProgress variant="determinate" value={Math.min(100, energySaved * 2)} color="success" size={60} />
        </Grid>
        <Grid item>
          <Typography variant="body1">Efficiency Gain: {energySaved}%</Typography>
        </Grid>
      </Grid>
      <div style={{ height: 320, marginTop: 24 }}>
        <Line data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Efficiency Trend' } } }} />
      </div>
    </Paper>
  );
}