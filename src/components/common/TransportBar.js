import React, { useState, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import MenuIcon from '@mui/icons-material/Menu';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';

const TransportBar = ({ 
  isPlaying,
  currentTime,
  duration,
  hasRecording,
  onPlayPause,
  onPrevMarker,
  onNextMarker,
  onABLoop,
  onMenu,
  onSeek,
  isRecording
}) => {
  // State for repeat mode cycling
  const [repeatMode, setRepeatMode] = useState(0); // 0: Repeat, 1: RepeatOne, 2: RepeatOn

  // Ref for the timeline bar
  const timelineRef = useRef(null);

  const handleRepeatClick = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const getRepeatIcon = () => {
    switch(repeatMode) {
      case 0:
        return <RepeatIcon sx={{ fontSize: '1.6rem' }} />;
      case 1:
        return <RepeatOneIcon sx={{ fontSize: '1.6rem' }} />;
      case 2:
        return <RepeatOnIcon sx={{ fontSize: '1.6rem' }} />;
      default:
        return <RepeatIcon sx={{ fontSize: '1.6rem' }} />;
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle click on timeline for seeking
  const handleTimelineClick = (event) => {
    if (!hasRecording || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(clickX / width, 0), 1);
    const seekTime = percent * duration;
    if (onSeek) onSeek(seekTime);
  };

  return (
    <Box sx={{ 
      width: '402px',
      margin: '0 auto',
      position: 'relative',
      py: 0.5,
      backgroundColor: '#f5f5f5',
      userSelect: isRecording ? 'none' : 'auto',
      pointerEvents: isRecording ? 'none' : 'auto',
    }}>
      {/* Transport Controls Container */}
      <Box sx={{ 
        width: '100%',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 0,
        backgroundColor: '#e0e0e0'
      }}>
        {/* Left Controls Group */}
        <IconButton 
          size="medium"
          onClick={handleRepeatClick}
          disabled={!hasRecording || isRecording}
          sx={{ 
            position: 'absolute',
            left: '15%',
            color: 'text.secondary',
            padding: 1.5
          }}
        >
          {getRepeatIcon()}
        </IconButton>
        <IconButton 
          size="medium"
          onClick={onPrevMarker}
          disabled={!hasRecording || isRecording}
          sx={{ 
            position: 'absolute',
            left: '30%',
            color: 'text.secondary',
            padding: 1.5
          }}
        >
          <SkipPreviousIcon sx={{ fontSize: '1.6rem' }} />
        </IconButton>

        {/* Center Play Button */}
        <IconButton
          onClick={onPlayPause}
          disabled={!hasRecording || isRecording}
          sx={{
            width: 58,
            height: 58,
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#f0f0f0' },
            '&.Mui-disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {isPlaying ? 
            <PauseIcon sx={{ fontSize: '2rem' }} /> : 
            <PlayArrowIcon sx={{ fontSize: '2rem' }} />
          }
        </IconButton>

        {/* Right Controls Group */}
        <IconButton 
          size="medium"
          onClick={onNextMarker}
          disabled={!hasRecording || isRecording}
          sx={{ 
            position: 'absolute',
            right: '30%',
            color: 'text.secondary',
            padding: 1.5
          }}
        >
          <SkipNextIcon sx={{ fontSize: '1.6rem' }} />
        </IconButton>
        <IconButton 
          size="medium"
          onClick={onMenu}
          disabled={isRecording}
          sx={{ 
            position: 'absolute',
            right: '15%',
            color: 'text.secondary',
            padding: 1.5
          }}
        >
          <MenuIcon sx={{ fontSize: '1.6rem' }} />
        </IconButton>
      </Box>

      {/* SIMPLE TIMELINE ROW: timecode - timeline - timecode */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 1,
        backgroundColor: '#fff',
        userSelect: isRecording ? 'none' : 'auto',
      }}>
        {/* Current Time */}
        <Typography sx={{ width: 50, textAlign: 'right', pr: 1 }}>
          {formatTime(currentTime)}
        </Typography>
        {/* Timeline Bar */}
        <Box
          ref={timelineRef}
          sx={{
            flex: 1,
            height: 8,
            backgroundColor: '#e0e0e0',
            borderRadius: 4,
            mx: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            cursor: hasRecording && !isRecording ? 'pointer' : 'default',
            position: 'relative'
          }}
          onClick={isRecording ? undefined : handleTimelineClick}
        >
          <Box sx={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'primary.main',
            borderRadius: 4,
            transition: 'width 0.1s linear'
          }} />
        </Box>
        {/* Duration */}
        <Typography sx={{ width: 50, textAlign: 'left', pl: 1 }}>
          {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};

export default TransportBar; 