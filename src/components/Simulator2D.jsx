import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';


export default function Simulator2D({
  carPosition,
  distanceToLight,
  lightStatus,
  isV2V = false,
  leadPosition = 0,
}) {
  // Prevent division by zero or negative values
  const safeDistance = Math.max(distanceToLight, 100);
  const followerPercent = Math.min(95, Math.max(0, (carPosition / safeDistance) * 100));
  const leadPercent = isV2V ? Math.min(95, Math.max(0, (leadPosition / safeDistance) * 100)) : 0;

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 100, sm: 120 },
        width: '100%',
        background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        mb: 3,
      }}
    >
      {/* Road markings */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 40px, #fef08a 40px, #fef08a 50px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Horizon line / perspective hint */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(to right, transparent, #9ca3af 40%, #9ca3af 60%, transparent)',
          opacity: 0.6,
        }}
      />

      {/* Follower vehicle */}
      <Tooltip
        title={
          <React.Fragment>
            <Typography variant="subtitle2">Your Vehicle (Follower)</Typography>
            <Typography variant="body2">Position: {Math.round(carPosition)} m</Typography>
          </React.Fragment>
        }
        arrow
        placement="top"
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 12, sm: 18 },
            left: `${followerPercent}%`,
            transform: 'translateX(-50%)',
            transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#1d4ed8',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
            zIndex: 10,
          }}
        >
          <DirectionsCarIcon sx={{ fontSize: { xs: 48, sm: 56 } }} />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.75)',
              color: 'white',
              px: 1,
              borderRadius: 1,
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
            }}
          >
            You
          </Typography>
        </Box>
      </Tooltip>

      {/* Lead vehicle (V2V only) */}
      {isV2V && (
        <Tooltip
          title={
            <React.Fragment>
              <Typography variant="subtitle2">Lead Vehicle</Typography>
              <Typography variant="body2">Gap: {Math.round(leadPosition - carPosition)} m</Typography>
            </React.Fragment>
          }
          arrow
          placement="top"
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 12, sm: 18 },
              left: `${leadPercent}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              color: '#b91c1c',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
              zIndex: 9,
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: { xs: 48, sm: 56 } }} />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0,0,0,0.75)',
                color: 'white',
                px: 1,
                borderRadius: 1,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              Lead
            </Typography>
          </Box>
        </Tooltip>
      )}

      {/* Traffic light (V2I only) */}
      {!isV2V && lightStatus !== 'off' && (
        <Tooltip title={`Traffic Light: ${lightStatus.toUpperCase()}`} arrow placement="left">
          <Box
            sx={{
              position: 'absolute',
              right: { xs: 16, sm: 24 },
              top: { xs: 12, sm: 16 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.6)',
              borderRadius: 2,
              p: 1,
              boxShadow: 4,
              zIndex: 20,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: lightStatus === 'red' ? '#ef4444' : '#4b5563',
                mb: 1,
                boxShadow: lightStatus === 'red' ? '0 0 12px #ef4444' : 'none',
              }}
            />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: lightStatus === 'yellow' ? '#fbbf24' : '#4b5563',
                mb: 1,
                boxShadow: lightStatus === 'yellow' ? '0 0 12px #fbbf24' : 'none',
              }}
            />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: lightStatus === 'green' ? '#22c55e' : '#4b5563',
                boxShadow: lightStatus === 'green' ? '0 0 12px #22c55e' : 'none',
              }}
            />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}