import React, { useState, useEffect } from 'react';
import { Typography, Paper, Button, Grid, CircularProgress, Tooltip, Box, Alert } from '@mui/material';
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
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function V2GSimulator() {
  const [batteryLevel, setBatteryLevel] = useState(68);
  const [powerFlow, setPowerFlow] = useState(0); // kW (positive = charging, negative = discharging)
  const [pricePerKWh, setPricePerKWh] = useState(0.14);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsHistory, setSavingsHistory] = useState([0]);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('smart'); // 'charge', 'discharge', 'smart'

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      // Simulate fluctuating electricity price
      setPricePerKWh((prev) => {
        const fluctuation = (Math.random() - 0.5) * 0.035;
        return Math.max(0.07, Math.min(0.32, prev + fluctuation));
      });

      let newPower = 0;
      let savingsDelta = 0;

      if (mode === 'charge' || (mode === 'smart' && pricePerKWh < 0.11)) {
        newPower = 9.6; // kW charging
        savingsDelta = -pricePerKWh * (newPower / 3600); // cost per second
      } else if (mode === 'discharge' || (mode === 'smart' && pricePerKWh > 0.22)) {
        newPower = -6.6; // kW discharging (V2G)
        savingsDelta = -pricePerKWh * (newPower / 3600); // revenue (negative power × price)
      }

      setPowerFlow(newPower);

      // Update battery (assuming ~60–80 kWh pack)
      setBatteryLevel((prev) => {
        const change = (newPower * (1 / 3600)) / 0.7; // rough % per second
        return Math.min(100, Math.max(15, prev + change));
      });

      setTotalSavings((prev) => prev + savingsDelta);
      setSavingsHistory((prev) => [...prev, prev[prev.length - 1] + savingsDelta]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, pricePerKWh]);

  const chartData = {
    labels: savingsHistory.map((_, i) => i),
    datasets: [{
      label: 'Cumulative Savings (€ / $)',
      data: savingsHistory,
      borderColor: totalSavings >= 0 ? '#2e7d32' : '#d32f2f',
      backgroundColor: totalSavings >= 0 ? 'rgba(46, 125, 50, 0.15)' : 'rgba(211, 47, 47, 0.15)',
      fill: true,
    }],
  };

  const exportData = () => {
    const csvData = savingsHistory.map((val, i) => ({
      Time: i,
      Battery: batteryLevel.toFixed(1),
      PowerFlow: powerFlow.toFixed(1),
      Price: pricePerKWh.toFixed(3),
      Savings: val.toFixed(2),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'v2g_simulation.csv';
    link.click();
  };

  const getBatteryColor = () => {
    if (batteryLevel > 70) return 'success';
    if (batteryLevel > 30) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        V2G Simulator: Vehicle-to-Grid Smart Energy Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <motion.div
          animate={{ scale: powerFlow !== 0 ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 1.2, repeat: powerFlow !== 0 ? Infinity : 0 }}
        >
          <CircularProgress
            variant="determinate"
            value={batteryLevel}
            color={getBatteryColor()}
            size={140}
            thickness={5}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {Math.round(batteryLevel)}%
            </Typography>
            {powerFlow > 0 && <BatteryChargingFullIcon color="success" fontSize="large" />}
            {powerFlow < 0 && <BatteryChargingFullIcon sx={{ transform: 'scaleX(-1)' }} color="secondary" fontSize="large" />}
          </Box>
        </motion.div>
      </Box>

      <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Tooltip title="Force charging regardless of price">
            <Button
              variant={mode === 'charge' ? 'contained' : 'outlined'}
              color="success"
              fullWidth
              onClick={() => setMode('charge')}
            >
              Force Charge
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Tooltip title="Force V2G discharge (sell energy)">
            <Button
              variant={mode === 'discharge' ? 'contained' : 'outlined'}
              color="secondary"
              fullWidth
              onClick={() => setMode('discharge')}
            >
              Force Discharge
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Tooltip title="Automatically optimize based on price">
            <Button
              variant={mode === 'smart' ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
              onClick={() => setMode('smart')}
            >
              Smart Mode
            </Button>
          </Tooltip>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="subtitle1">
          Current price: <strong>{pricePerKWh.toFixed(3)} €/kWh</strong>
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Power flow:{' '}
          <strong style={{ color: powerFlow > 0 ? '#2e7d32' : powerFlow < 0 ? '#d81b60' : '#757575' }}>
            {powerFlow > 0 ? `+${powerFlow.toFixed(1)} kW` : powerFlow < 0 ? `${powerFlow.toFixed(1)} kW` : 'Idle'}
          </strong>
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: totalSavings >= 0 ? 'success.main' : 'error.main' }}>
          Total savings: {totalSavings.toFixed(2)} €
        </Typography>
      </Box>

      {mode === 'smart' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Smart mode: charges when electricity is cheap ( ~0.11 €/kWh) and discharges when expensive ( ~0.22 €/kWh)
        </Alert>
      )}

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              onClick={() => setIsRunning(!isRunning)}
              sx={{ minWidth: 160 }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </motion.div>
        </Grid>

        <Grid item>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setBatteryLevel(68);
                setPowerFlow(0);
                setTotalSavings(0);
                setSavingsHistory([0]);
                setPricePerKWh(0.14);
                setMode('smart');
              }}
            >
              Reset
            </Button>
          </motion.div>
        </Grid>

        <Grid item>
          <Tooltip title="Export simulation data">
            <IconButton onClick={exportData} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <div style={{ height: 340, marginTop: 32 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: 'Financial Savings from V2G' } },
            scales: {
              y: { title: { display: true, text: 'Cumulative Savings (€)' } },
            },
          }}
        />
      </div>
    </Paper>
  );
}