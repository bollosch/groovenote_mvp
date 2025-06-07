import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAudioContext } from '../../context/AudioContext';

const BlurredRecordingOverlay = () => {
  const { isRecording } = useAudioContext();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferRef = useRef([]); // Holds the waveform data
  const prevIsRecording = useRef(false);

  useEffect(() => {
    const setupVisualization = async () => {
      if (!isRecording || !canvasRef.current) return;

      try {
        // Cleanup previous audio context if it exists
        if (audioContextRef.current?.state !== 'closed') {
          await audioContextRef.current?.close();
        }

        // Get audio stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Setup audio context and analyzer
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current = source;
        
        const analyser = audioContextRef.current.createAnalyser();
        analyserRef.current = analyser;
        
        // Connect source to analyzer
        source.connect(analyser);
        
        // Configure analyzer
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        
        // Initialize buffer with zeros
        const canvas = canvasRef.current;
        const width = canvas.width;
        bufferRef.current = new Array(width).fill(0);

        // Animation function
        const draw = () => {
          if (!isRecording) return;
          
          // Get waveform data
          analyser.getFloatTimeDomainData(dataArray);
          
          // Calculate positive envelope value (max absolute value)
          const envelopeValue = Math.max(...Array.from(dataArray).map(Math.abs));
          
          // Shift buffer left and add new value
          bufferRef.current.shift();
          bufferRef.current.push(envelopeValue);
          
          // Draw
          const ctx = canvas.getContext('2d');
          const height = canvas.height;
          
          // Clear and set background
          ctx.fillStyle = '#fafbfc';
          ctx.fillRect(0, 0, width, height);
          
          // Draw waveform
          ctx.beginPath();
          ctx.moveTo(width, height / 2);
          
          // Draw from right to left
          for (let i = 0; i < width; i++) {
            const value = bufferRef.current[i];
            const x = width - i;
            const y = height / 2 - (value * height / 2);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          // Mirror the waveform below the center
          for (let i = width - 1; i >= 0; i--) {
            const value = bufferRef.current[i];
            const x = width - i;
            const y = height / 2 + (value * height / 2);
            ctx.lineTo(x, y);
          }
          
          ctx.closePath();
          ctx.fillStyle = '#1976d2';
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          
          animationFrameRef.current = requestAnimationFrame(draw);
        };
        
        draw();
      } catch (error) {
        console.error('Error setting up audio visualization:', error);
      }
    };

    if (isRecording && !prevIsRecording.current) {
      setupVisualization();
    }
    prevIsRecording.current = isRecording;

    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Disconnect source if it exists
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Close audio context if it exists and isn't already closed
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(console.error);
      }
    };
  }, [isRecording]);

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
      <Box
        sx={{
          height: '120px',
          width: '100%',
          backgroundColor: '#fafbfc',
          borderBottom: '2px solid #1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={120}
          style={{
            width: '100%',
            height: '100%',
          }}
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