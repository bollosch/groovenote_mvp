import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAudioContext } from '../../context/AudioContext';

const BlurredRecordingOverlay = () => {
  const { isRecording } = useAudioContext();

  if (!isRecording) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50px', // Start just below the header
        left: 0,
        right: 0,
        bottom: 60, // End just above the navigation bar
        zIndex: 8, // Below recording controls
        pointerEvents: 'none', // Allow interaction with controls above
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Waveform container - visually distinct for debugging */}
      <Box
        sx={{
          height: '120px',
          width: '100%',
          backgroundColor: 'rgba(180, 180, 255, 0.25)', // More visible
          borderBottom: '2px solid #7b61ff', // More visible border
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="caption" sx={{ color: '#7b61ff', fontWeight: 'bold' }}>
          Waveform Container (Debug)
        </Typography>
      </Box>
      {/* Remaining blurred area for content and transport bar */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
    </Box>
  );
};

export default BlurredRecordingOverlay; 