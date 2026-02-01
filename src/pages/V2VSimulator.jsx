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

export default function V2VSimulator() {
  const [followerSpeed, setFollowerSpeed] = useState(62);
  const [followerPosition, setFollowerPosition] = useState(0);
  const [gapToLead, setGapToLead] = useState(45);
  const [advice, setAdvice] = useState('Maintain safe following distance');
  const [energySaved, setEnergySaved] = useState(0);
  const [energyHistory, setEnergyHistory] = useState([0]);
  const [isRunning, setIsRunning] = useState(false);

  const LEAD_SPEED = 68;
  const OPTIMAL_GAP_MIN = 10;
  const OPTIMAL_GAP_MAX = 20;
  const MAX_PLATOON_BENEFIT_GAP = 45;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setFollowerPosition((prev) => prev + followerSpeed / 3.6);

      const relativeSpeed = (LEAD_SPEED - followerSpeed) / 3.6;
      setGapToLead((prev) => Math.max(5, prev + relativeSpeed));

      let newAdvice = '';
      let delta = 0;

      if (gapToLead < 6) {
        newAdvice = 'TOO CLOSE – Increase distance for safety';
        delta = -1.5;
      } else if (gapToLead <= OPTIMAL_GAP_MIN) {
        newAdvice = 'Slightly too close – ease off a bit';
        delta = 1.2;
      } else if (gapToLead <= OPTIMAL_GAP_MAX) {
        newAdvice = 'Optimal platooning distance – maximum drag reduction';
        delta = 3.8;
      } else if (gapToLead <= MAX_PLATOON_BENEFIT_GAP) {
        newAdvice = 'Increase speed slightly to close the gap';
        delta = 1.8;
      } else {
        newAdvice = 'Gap too large – no significant platooning benefit';
        delta = 0;
      }

      setAdvice(newAdvice);
      setEnergySaved((p) => Math.max(0, p + delta));
      setEnergyHistory((p) => [...p, Math.max(0, p[p.length - 1] + delta)]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, followerSpeed, gapToLead]);

  const chartData = {
    labels: energyHistory.map((_, i) => i),
    datasets: [{
      label: 'Platooning Efficiency Gain (%)',
      data: energyHistory,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      fill: true,
      tension: 0.3,
    }],
  };

  const exportData = () => {
    const csv = Papa.unparse(
      energyHistory.map((v, i) => ({
        Time: i,
        'Gap to Lead (m)': gapToLead.toFixed(1),
        'Efficiency Gain': v.toFixed(1),
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'v2v_platooning.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const leadPosition = followerPosition + gapToLead;

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
        V2V – Platooning & Aerodynamic Efficiency
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Maintain optimal distance to the lead vehicle to reduce drag and save energy.
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 } }}>
        <Simulator2D
          carPosition={followerPosition}
          distanceToLight={800}
          lightStatus="off"
          isV2V={true}
          leadPosition={leadPosition}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Follower Speed (km/h)
          </Typography>
          <Slider
            value={followerSpeed}
            onChange={(_, v) => setFollowerSpeed(v)}
            min={40}
            max={90}
            step={1}
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
            color={isRunning ? 'warning' : 'error'}
            onClick={() => setIsRunning(!isRunning)}
            fullWidth
            sx={{ minWidth: 180 }}
          >
            {isRunning ? 'Pause Platooning' : 'Start Platooning'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setFollowerPosition(0);
              setGapToLead(45);
              setEnergySaved(0);
              setEnergyHistory([0]);
              setAdvice('Maintain safe following distance');
            }}
            fullWidth
            sx={{ minWidth: 160 }}
          >
            Reset
          </Button>
        </motion.div>

        <Tooltip title="Export data as CSV">
          <IconButton color="primary" size="large" onClick={exportData}>
            <DownloadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 5 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Current Recommendation
        </Typography>
        <Typography
          variant="h6"
          color={
            advice.includes('TOO CLOSE') || advice.includes('too large')
              ? 'error'
              : advice.includes('Optimal')
              ? 'success'
              : 'warning'
          }
          sx={{ mb: 3 }}
        >
          {advice}
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <CircularProgress
              variant="determinate"
              value={Math.min(100, energySaved * 1.8)}
              color="error"
              size={80}
              thickness={5}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="body1">
              Platooning Efficiency Gain
              <br />
              <strong style={{ fontSize: '1.5rem' }}>{energySaved.toFixed(1)} %</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Typography variant="body2" color="text.secondary">
              Gap to lead vehicle: <strong>{gapToLead.toFixed(1)} m</strong>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ height: 380 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Platooning Efficiency Trend', font: { size: 16 } },
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