import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import TransportBar from './TransportBar';

const AudioControls = ({ isRecording, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const shouldDeleteRef = useRef(false);
  const timeUpdateIntervalRef = useRef(null);

  // Helper: get current blob
  const currentAudioBlob = recordings.length > 0 ? recordings[recordings.length - 1] : null;

  // Initialize media recorder
  useEffect(() => {
    async function setupMediaRecorder() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            if (!shouldDeleteRef.current) {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setRecordings(prev => [...prev, blob]);
              
              // Get duration of the new recording
              const audio = new Audio(URL.createObjectURL(blob));
              audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
              });
            } else {
              // Delete mode: clear everything
              console.log('Delete mode: clearing all recordings');
              setRecordings([]);
              setDuration(0);
              setCurrentTime(0);
              shouldDeleteRef.current = false;
            }
          }
          audioChunksRef.current = [];
        };
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
    setupMediaRecorder();
  }, []);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording && mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    } else if (!isRecording && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Reset recording when onReset is called
  useEffect(() => {
    if (onReset) {
      const resetRecording = () => {
        console.log('Reset function called');
        
        // Stop and cleanup any playing audio
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Clear timing intervals
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
        
        // Handle recording state
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('Currently recording, setting delete flag and stopping');
          shouldDeleteRef.current = true;
          mediaRecorderRef.current.stop();
        } else {
          console.log('Not recording, clearing recordings immediately');
          setRecordings([]);
          setDuration(0);
        }
      };
      onReset(resetRecording);
    }
  }, [onReset]);

  const handlePlayPause = () => {
    if (!currentAudioBlob) return;

    if (isPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        clearInterval(timeUpdateIntervalRef.current);
      }
      setIsPlaying(false);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(URL.createObjectURL(currentAudioBlob));
        audioPlayerRef.current.currentTime = currentTime;
        
        // Handle end of audio
        audioPlayerRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          clearInterval(timeUpdateIntervalRef.current);
          audioPlayerRef.current = null;
        };
      }
      
      audioPlayerRef.current.play();
      setIsPlaying(true);

      // Update current time
      timeUpdateIntervalRef.current = setInterval(() => {
        if (audioPlayerRef.current) {
          setCurrentTime(audioPlayerRef.current.currentTime);
        }
      }, 100);
    }
  };

  // Seek handler for timeline
  const handleSeek = (newTime) => {
    if (!currentAudioBlob) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(URL.createObjectURL(currentAudioBlob));
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timeUpdateIntervalRef.current);
        audioPlayerRef.current = null;
      };
    }
    audioPlayerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    audioPlayerRef.current.play();
    setIsPlaying(true);
    if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioPlayerRef.current) {
        setCurrentTime(audioPlayerRef.current.currentTime);
      }
    }, 100);
  };

  // Dummy handlers for other transport controls
  const handlePrevMarker = () => console.log('Previous marker clicked');
  const handleNextMarker = () => console.log('Next marker clicked');
  const handleABLoop = () => console.log('AB Loop clicked');
  const handleMenu = () => console.log('Menu clicked');

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