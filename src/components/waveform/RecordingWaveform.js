import React, { useRef, useEffect } from 'react';
import { FEATURES } from '../../config/features';
import PropTypes from 'prop-types';
import BlockWaveform from './BlockWaveform';
import CanvasWaveform from './CanvasWaveform';

const RecordingWaveform = ({
  audioBlob,
  isRecording,
  height,
  width,
  waveColor = '#1976d2',
  progressColor = '#64b5f6',
  showProgress = false,
  onPositionChange,
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferRef = useRef([]);
  const prevIsRecording = useRef(false);

  // Original canvas-based visualization
  useEffect(() => {
    if (!FEATURES.USE_BLOCK_WAVEFORM) {
      const setupVisualization = async () => {
        if (!isRecording || !canvasRef.current) return;

        try {
          if (audioContextRef.current?.state !== 'closed') {
            await audioContextRef.current?.close();
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          sourceRef.current = source;
          
          const analyser = audioContextRef.current.createAnalyser();
          analyserRef.current = analyser;
          
          source.connect(analyser);
          
          analyser.fftSize = 2048;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);
          
          const canvas = canvasRef.current;
          const width = canvas.width;
          bufferRef.current = new Array(width).fill(0);

          const draw = () => {
            if (!isRecording) return;
            
            analyser.getFloatTimeDomainData(dataArray);
            const envelopeValue = Math.max(...Array.from(dataArray).map(Math.abs));
            
            bufferRef.current.push(envelopeValue);
            if (bufferRef.current.length > width) bufferRef.current.shift();
            
            const ctx = canvas.getContext('2d');
            const height = canvas.height;
            
            ctx.fillStyle = '#fafbfc';
            ctx.fillRect(0, 0, width, height);
            
            ctx.beginPath();
            for (let i = 0; i < bufferRef.current.length; i++) {
              const value = bufferRef.current[i];
              const x = i;
              const y = height / 2 - (value * height / 2);
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            for (let i = bufferRef.current.length - 1; i >= 0; i--) {
              const value = bufferRef.current[i];
              const x = i;
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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close().catch(console.error);
        }
      };
    }
  }, [isRecording]);

  if (FEATURES.USE_BLOCK_WAVEFORM) {
    return (
      <BlockWaveform
        audioBlob={audioBlob}
        isRecording={isRecording}
        height={height}
        width={width}
        waveColor={waveColor}
        progressColor={progressColor}
        showProgress={showProgress}
        onPositionChange={onPositionChange}
      />
    );
  }

  return (
    <CanvasWaveform
      audioBlob={audioBlob}
      isRecording={isRecording}
      height={height}
      width={width}
      waveColor={waveColor}
      progressColor={progressColor}
      showProgress={showProgress}
      onPositionChange={onPositionChange}
    />
  );
};

RecordingWaveform.propTypes = {
  audioBlob: PropTypes.instanceOf(Blob),
  isRecording: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  waveColor: PropTypes.string,
  progressColor: PropTypes.string,
  showProgress: PropTypes.bool,
  onPositionChange: PropTypes.func,
};

export default RecordingWaveform; 