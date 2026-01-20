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

export default function V2VSimulator() {
  const [followerSpeed, setFollowerSpeed] = useState(62);
  const [followerPosition, setFollowerPosition] = useState(0);
  const [gapToLead, setGapToLead] = useState(45); // initial gap in meters
  const [advice, setAdvice] = useState('Maintain safe following distance');
  const [energySaved, setEnergySaved] = useState(0);
  const [energyHistory, setEnergyHistory] = useState([0]);
  const [isRunning, setIsRunning] = useState(false);

  // Platooning parameters
  const LEAD_SPEED = 68;              // km/h (lead vehicle slightly faster)
  const OPTIMAL_GAP_MIN = 10;
  const OPTIMAL_GAP_MAX = 20;
  const MAX_PLATOON_BENEFIT_GAP = 45;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      // Move follower
      setFollowerPosition((prev) => prev + (followerSpeed / 3.6));

      // Lead vehicle moves at constant speed
      const leadPosition = followerPosition + gapToLead + (LEAD_SPEED - followerSpeed) / 3.6;

      // Update gap (approximate dynamic behavior)
      const relativeSpeed = (LEAD_SPEED - followerSpeed) / 3.6; // m/s
      setGapToLead((prevGap) => Math.max(5, prevGap + relativeSpeed));

      // Platooning efficiency logic
      let newAdvice = '';
      let energyDelta = 0;

      if (gapToLead < 6) {
        newAdvice = 'TOO CLOSE – Increase distance for safety';
        energyDelta = -1.5;
      } else if (gapToLead <= OPTIMAL_GAP_MIN) {
        newAdvice = 'Slightly too close – ease off a bit';
        energyDelta = 1.2;
      } else if (gapToLead <= OPTIMAL_GAP_MAX) {
        newAdvice = 'Optimal platooning distance – maximum drag reduction';
        energyDelta = 3.8;
      } else if (gapToLead <= MAX_PLATOON_BENEFIT_GAP) {
        newAdvice = 'Increase speed slightly to close the gap';
        energyDelta = 1.8;
      } else {
        newAdvice = 'Gap too large – no significant platooning benefit';
        energyDelta = 0;
      }

      setAdvice(newAdvice);
      setEnergySaved((prev) => Math.max(0, prev + energyDelta));
      setEnergyHistory((prev) => [...prev, Math.max(0, prev[prev.length - 1] + energyDelta)]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, followerSpeed, followerPosition, gapToLead]);

  const chartData = {
    labels: energyHistory.map((_, i) => i),
    datasets: [{
      label: 'Platooning Efficiency Gain (%)',
      data: energyHistory,
      borderColor: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.12)',
      fill: true,
    }],
  };

  const exportData = () => {
    const csvData = energyHistory.map((val, i) => ({
      Time: i,
      Gap: gapToLead.toFixed(1),
      EnergySaved: val.toFixed(1),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'v2v_platooning_simulation.csv';
    link.click();
  };

  const leadPosition = followerPosition + gapToLead;

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        V2V Simulator: Platooning & Aerodynamic Efficiency
      </Typography>

      <Simulator2D
        carPosition={followerPosition}
        distanceToLight={800} // just for scaling – not really used
        lightStatus="off"
        isV2V={true}
        leadPosition={leadPosition}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Tooltip title="Your vehicle (follower) speed – try to match the lead vehicle">
            <div>
              <Typography gutterBottom>Follower Speed (km/h)</Typography>
              <Slider
                value={followerSpeed}
                onChange={(_, v) => setFollowerSpeed(v)}
                min={40}
                max={90}
                step={1}
                valueLabelDisplay="auto"
              />
            </div>
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setIsRunning(!isRunning)}
              sx={{ mr: 2, px: 4 }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setFollowerPosition(0);
                setGapToLead(45);
                setEnergySaved(0);
                setEnergyHistory([0]);
                setAdvice('Maintain safe following distance');
              }}
              sx={{ mr: 2, px: 4 }}
            >
              Reset
            </Button>
          </motion.div>

          <Tooltip title="Export simulation data (time, gap, efficiency)">
            <IconButton onClick={exportData} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="body1" sx={{ mt: 3, fontWeight: 500 }}>
          Recommendation: <strong>{advice}</strong>
        </Typography>
      </motion.div>

      <Typography variant="body1" sx={{ mt: 1 }}>
        Current gap to lead vehicle: <strong>{gapToLead.toFixed(1)} m</strong>
      </Typography>

      <Grid container alignItems="center" spacing={2} sx={{ mt: 3 }}>
        <Grid item>
          <CircularProgress
            variant="determinate"
            value={Math.min(100, energySaved * 1.8)}
            color="error"
            size={60}
          />
        </Grid>
        <Grid item>
          <Typography variant="body1">
            Platooning Efficiency Gain: <strong>{energySaved.toFixed(1)}%</strong>
          </Typography>
        </Grid>
      </Grid>

      <div style={{ height: 320, marginTop: 24 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: 'Platooning Efficiency Over Time' } },
          }}
        />
      </div>
    </Paper>
  );
}