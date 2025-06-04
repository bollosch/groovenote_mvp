import React from 'react';
import { Box } from '@mui/material';
import TransportBar from './TransportBar';
import { useAudioContext } from '../../context/AudioContext';

const AudioControls = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    isRecording,
    play,
    pause,
    seek,
    recordings,
    currentAudioBlob
  } = useAudioContext();

  // Dummy handlers for other transport controls
  const handlePrevMarker = () => console.log('Previous marker clicked');
  const handleNextMarker = () => console.log('Next marker clicked');
  const handleABLoop = () => console.log('AB Loop clicked');
  const handleMenu = () => console.log('Menu clicked');

  const handlePlayPause = () => {
    if (!currentAudioBlob) return;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (newTime) => {
    if (!currentAudioBlob) return;
    seek(newTime);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <TransportBar
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        hasRecording={!!currentAudioBlob}
        onPlayPause={handlePlayPause}
        onPrevMarker={handlePrevMarker}
        onNextMarker={handleNextMarker}
        onABLoop={handleABLoop}
        onMenu={handleMenu}
        onSeek={handleSeek}
      />
    </Box>
  );
};

export default AudioControls; 