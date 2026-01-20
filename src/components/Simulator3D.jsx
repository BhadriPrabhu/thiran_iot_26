import React from 'react';
import { motion } from 'framer-motion';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrafficIcon from '@mui/icons-material/Traffic';
import { Box, Tooltip } from '@mui/material';

export default function Simulator2D({ carPosition, distanceToLight, lightStatus, isV2V = false, leadPosition = 0 }) {
  const roadStyle = {
    position: 'relative',
    height: '80px',
    background: 'linear-gradient(90deg, #e0e0e0, #bdbdbd)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #9e9e9e',
    marginBottom: '16px',
  };

  const carStyle = {
    position: 'absolute',
    bottom: '20px',
    transition: 'left 0.3s ease',
    color: '#1976d2',
  };

  return (
    <Box sx={roadStyle}>
      <Tooltip title="Follower Vehicle">
        <motion.div
          style={{ ...carStyle, left: `${(carPosition / distanceToLight) * 90}%` }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <DirectionsCarIcon fontSize="large" />
        </motion.div>
      </Tooltip>
      {isV2V ? (
        <Tooltip title="Lead Vehicle">
          <motion.div style={{ ...carStyle, left: `${(leadPosition / distanceToLight) * 90}%`, color: '#dc004e' }}>
            <DirectionsCarIcon fontSize="large" />
          </motion.div>
        </Tooltip>
      ) : (
        <Tooltip title={`Traffic Light: ${lightStatus}`}>
          <Box sx={{ position: 'absolute', right: '5%', top: '20px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: lightStatus === 'red' ? 'red' : 'grey', mb: 0.5 }} />
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: lightStatus === 'yellow' ? 'yellow' : 'grey', mb: 0.5 }} />
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: lightStatus === 'green' ? 'green' : 'grey' }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}