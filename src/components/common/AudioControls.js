import React from 'react';
import { Box } from '@mui/material';
import TransportBar from './TransportBar';
import { useAudioContext } from '../../context/AudioContext';

const AudioControls = () => {
  const {
    play,
    pause,
    isPlaying,
    currentTime,
    duration,
    seek,
    currentAudioBlob,
    isRecording
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
        isRecording={isRecording}
      />
    </Box>
  );
};

export default AudioControls; 