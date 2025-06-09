import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const CanvasWaveform = ({
  audioBlob,
  isRecording,
  height,
  width,
  waveColor,
  progressColor,
  showProgress,
  onPositionChange,
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      const setupVisualization = async () => {
        try {
          // Cleanup previous context if it exists
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
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);
          
          const draw = () => {
            if (!isRecording) return;
            
            analyser.getFloatTimeDomainData(dataArray);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = waveColor;
            ctx.beginPath();
            
            const sliceWidth = width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] * 0.5;
              const y = (v * height) + (height / 2);
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              
              x += sliceWidth;
            }
            
            ctx.lineTo(width, height / 2);
            ctx.stroke();
            
            animationFrameRef.current = requestAnimationFrame(draw);
          };
          
          draw();
        } catch (error) {
          console.error('Error setting up audio visualization:', error);
        }
      };

      setupVisualization();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close().catch(console.error);
        }
      };
    }
  }, [isRecording, height, width, waveColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

CanvasWaveform.propTypes = {
  audioBlob: PropTypes.instanceOf(Blob),
  isRecording: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  waveColor: PropTypes.string,
  progressColor: PropTypes.string,
  showProgress: PropTypes.bool,
  onPositionChange: PropTypes.func,
};

export default CanvasWaveform; 