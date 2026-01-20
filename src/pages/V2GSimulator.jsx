import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Tooltip,
  Stack,
  Alert,
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
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function V2GSimulator() {
  const [batteryLevel, setBatteryLevel] = useState(68);
  const [powerFlow, setPowerFlow] = useState(0);
  const [pricePerKWh, setPricePerKWh] = useState(0.14);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsHistory, setSavingsHistory] = useState([0]);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('smart');

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setPricePerKWh((prev) => Math.max(0.07, Math.min(0.32, prev + (Math.random() - 0.5) * 0.035)));

      let newPower = 0;
      let delta = 0;

      if (mode === 'charge' || (mode === 'smart' && pricePerKWh < 0.11)) {
        newPower = 9.6;
        delta = -pricePerKWh * (newPower / 3600);
      } else if (mode === 'discharge' || (mode === 'smart' && pricePerKWh > 0.22)) {
        newPower = -6.6;
        delta = -pricePerKWh * (newPower / 3600);
      }

      setPowerFlow(newPower);

      setBatteryLevel((prev) => Math.min(100, Math.max(15, prev + (newPower / 3600) / 0.7)));

      setTotalSavings((p) => p + delta);
      setSavingsHistory((p) => [...p, p[p.length - 1] + delta]);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, pricePerKWh]);

  const chartData = {
    labels: savingsHistory.map((_, i) => i),
    datasets: [{
      label: 'Cumulative Savings (€)',
      data: savingsHistory,
      borderColor: totalSavings >= 0 ? '#10b981' : '#ef4444',
      backgroundColor: totalSavings >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      fill: true,
      tension: 0.3,
    }],
  };

  const exportData = () => {
    const csv = Papa.unparse(
      savingsHistory.map((v, i) => ({
        Time: i,
        Battery: batteryLevel.toFixed(1),
        'Power (kW)': powerFlow.toFixed(1),
        'Price (€/kWh)': pricePerKWh.toFixed(3),
        Savings: v.toFixed(2),
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'v2g_energy_arbitrage.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const batteryColor = batteryLevel > 70 ? 'success' : batteryLevel > 30 ? 'warning' : 'error';

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
        V2G – Smart Charging & Energy Arbitrage
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Charge when electricity is cheap, discharge (V2G) when prices are high.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <Box sx={{ position: 'relative' }}>
          <motion.div
            animate={powerFlow !== 0 ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 1.5, repeat: powerFlow !== 0 ? Infinity : 0, repeatType: 'reverse' }}
          >
            <CircularProgress
              variant="determinate"
              value={batteryLevel}
              color={batteryColor}
              size={160}
              thickness={6}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {Math.round(batteryLevel)}%
              </Typography>
              {powerFlow > 0 && (
                <BatteryChargingFullIcon color="success" sx={{ fontSize: 48, mt: 1 }} />
              )}
              {powerFlow < 0 && (
                <BatteryChargingFullIcon
                  sx={{ fontSize: 48, mt: 1, transform: 'scaleX(-1)' }}
                  color="secondary"
                />
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
        {['charge', 'discharge', 'smart'].map((m) => (
          <Grid item xs={12} sm={4} key={m}>
            <Button
              variant={mode === m ? 'contained' : 'outlined'}
              color={m === 'charge' ? 'success' : m === 'discharge' ? 'secondary' : 'primary'}
              fullWidth
              size="large"
              onClick={() => setMode(m)}
              sx={{ py: 1.8 }}
            >
              {m === 'charge' ? 'Force Charge' : m === 'discharge' ? 'Force V2G' : 'Smart Mode'}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 5 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={600}>
              Electricity Price
            </Typography>
            <Typography variant="h5" color="primary">
              {pricePerKWh.toFixed(3)} €/kWh
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={600}>
              Power Flow
            </Typography>
            <Typography
              variant="h5"
              color={powerFlow > 0 ? 'success.main' : powerFlow < 0 ? 'secondary.main' : 'text.secondary'}
            >
              {powerFlow > 0 ? `+${powerFlow.toFixed(1)}` : powerFlow.toFixed(1)} kW
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" fontWeight={600}>
              Total Savings
            </Typography>
            <Typography variant="h5" color={totalSavings >= 0 ? 'success.main' : 'error.main'}>
              {totalSavings.toFixed(2)} €
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {mode === 'smart' && (
        <Alert severity="info" sx={{ mb: 5 }}>
          Smart mode automatically charges when price &lt; ~0.11 €/kWh and discharges when &gt; ~0.22 €/kWh.
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        sx={{ mb: 5 }}
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsRunning(!isRunning)}
            fullWidth
            sx={{ minWidth: 180 }}
          >
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setBatteryLevel(68);
              setPowerFlow(0);
              setTotalSavings(0);
              setSavingsHistory([0]);
              setPricePerKWh(0.14);
              setMode('smart');
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

      <Box sx={{ height: 380 }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Savings from Smart Charging & V2G', font: { size: 16 } },
              legend: { position: 'top' },
            },
            scales: {
              y: { title: { display: true, text: 'Cumulative Savings (€)' } },
              x: { title: { display: true, text: 'Time (seconds)' } },
            },
          }}
        />
      </Box>
    </Paper>
  );
}