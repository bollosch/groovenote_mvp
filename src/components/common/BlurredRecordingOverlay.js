import React from 'react';
import { Box } from '@mui/material';
import { useAudioContext } from '../../context/AudioContext';
import RecordingWaveform from '../waveform/RecordingWaveform';

const BlurredRecordingOverlay = () => {
  const { isRecording, currentAudioBlob } = useAudioContext();

  if (!isRecording) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50px',
        left: 0,
        right: 0,
        bottom: 60,
        zIndex: 8,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%', height: '110px', position: 'relative', backgroundColor: '#fafbfc', marginTop: '2px' }}>
        <RecordingWaveform
          audioBlob={currentAudioBlob}
          isRecording={isRecording}
          height={110}
          width={400}
          waveColor="#1976d2"
          progressColor="#90caf9"
          showProgress={false}
        />
      </Box>
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