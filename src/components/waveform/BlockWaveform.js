import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { AudioVisualizer } from 'react-audio-visualize';

const BlockWaveform = ({
  audioBlob,
  isRecording,
  height,
  width,
  waveColor,
  progressColor,
  showProgress,
  onPositionChange,
  markers = [],
}) => {
  const [mediaElement, setMediaElement] = useState(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const markersRef = useRef(markers);
  const markerElementsRef = useRef({});

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  // Handle live recording visualization
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
          
          analyser.fftSize = 512; // for faster response
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);
          
          const markerTriangleHeight = 10;
          const canvas = canvasRef.current;
          if (!canvas) return;

          // High-DPI scaling
          const dpr = window.devicePixelRatio || 1;
          const cssWidth = width;
          const cssHeight = height + markerTriangleHeight;
          canvas.width = Math.round(cssWidth * dpr);
          canvas.height = Math.round(cssHeight * dpr);
          canvas.style.width = cssWidth + 'px';
          canvas.style.height = cssHeight + 'px';

          const ctx = canvas.getContext('2d');
          ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transforms
          ctx.scale(dpr, dpr);
          ctx.imageSmoothingEnabled = false;
          // === CONFIGURABLE PARAMETERS ===
          const barWidth = 2;
          const gap = 1;
          const desiredScrollDurationMs = 10000; // 20 seconds for the whole waveform to scroll off
          // ==============================
          let totalBars = Math.ceil(width / (barWidth + gap));
          if (!Number.isFinite(totalBars) || totalBars <= 0) {
            console.warn('BlockWaveform: Invalid totalBars calculation', { width, barWidth, gap, totalBars });
            totalBars = 100; // fallback
          }
          let barBuffer = new Array(totalBars).fill(0);
          const totalWidthPx = totalBars * (barWidth + gap);
          const msPerPixel = desiredScrollDurationMs / totalWidthPx;
          let scrollOffset = 0; // in pixels
          let lastTimestamp = performance.now();
          let lastBarValue = 0; // For fade-out logic

          const draw = (timestamp) => {
            if (!isRecording) return;
            const deltaMs = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            // How many pixels to scroll this frame?
            const deltaPixels = deltaMs / msPerPixel;
            scrollOffset += deltaPixels;
            const oneBarPx = barWidth + gap;
            // If we've scrolled at least one bar width, shift buffer and add new amplitude(s)
            if (scrollOffset >= oneBarPx) {
              const barsToShift = Math.floor(scrollOffset / oneBarPx);
              scrollOffset -= barsToShift * oneBarPx;
              for (let i = 0; i < barsToShift; i++) {
                analyser.getFloatTimeDomainData(dataArray);
                // Compute peak over the entire window
                let peak = 0;
                for (let j = 0; j < dataArray.length; j++) {
                  const absVal = Math.abs(dataArray[j]);
                  if (absVal > peak) peak = absVal;
                }
                // Dead zone and quick fade logic
                const eps = 1e-4;
                const safePeak = Math.max(peak, eps);
                const dB = 20 * Math.log10(safePeak);
                const dBDead = -80;   // below this, bar = 0
                const dBFloor = -70;  // between dBDead and dBFloor, quick fade
                const fadeFactor = 0.6;
                let norm;
                if (dB <= dBDead) {
                  norm = 0;
                } else if (dB < dBFloor) {
                  norm = lastBarValue * fadeFactor;
                  if (norm < 0.02) norm = 0;
                } else {
                  norm = (dB - dBFloor) / (0 - dBFloor);
                  norm = Math.max(0, Math.min(norm, 1));
                }
                barBuffer.shift();
                barBuffer.push(norm);
                lastBarValue = norm;
              }
            }
            // Clear canvas
            ctx.clearRect(0, 0, width, cssHeight);
            // Draw bars with integer pixel alignment
            ctx.fillStyle = waveColor;
            for (let i = 0; i < totalBars; i++) {
              const x = Math.round(i * (barWidth + gap) - scrollOffset);
              const barHeight = Math.round(barBuffer[i] * height);
              if (x + barWidth >= 0 && x <= width) {
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
              }
            }
            
            // Update positions of marker elements
            const currentMarkers = markersRef.current;
            const nowSec = Date.now() / 1000;
            const bufferDuration = desiredScrollDurationMs / 1000;
            const displayedMarkers = {};

            if (currentMarkers && currentMarkers.length > 0) {
              currentMarkers.forEach(marker => {
                const markerAgeSec = nowSec - marker.time;
                displayedMarkers[marker.id] = true;
                const markerEl = markerElementsRef.current[marker.id];

                if (markerAgeSec >= 0 && markerAgeSec <= bufferDuration) {
                  const markerX = Math.round(width - (markerAgeSec / bufferDuration) * width);
                  if (markerEl) {
                    markerEl.style.transform = `translateX(${markerX}px)`;
                    markerEl.style.visibility = 'visible';
                  }
                } else {
                  if (markerEl) {
                    markerEl.style.visibility = 'hidden';
                  }
                }
              });
            }

            // Hide markers that are no longer in the list
            for (const id in markerElementsRef.current) {
              if (!displayedMarkers[id]) {
                const markerEl = markerElementsRef.current[id];
                if (markerEl) {
                  markerEl.style.visibility = 'hidden';
                }
              }
            }

            animationFrameRef.current = requestAnimationFrame(draw);
          };
          // Start animation with timestamp
          animationFrameRef.current = requestAnimationFrame(draw);
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

  // Handle completed recording visualization
  useEffect(() => {
    if (audioBlob && !isRecording) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.controls = false;
      setMediaElement(audio);
      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      };
    }
  }, [audioBlob, isRecording]);

  const handlePositionChange = (position) => {
    if (onPositionChange && audioRef.current) {
      const duration = audioRef.current.duration;
      onPositionChange(position * duration);
    }
  };

  return (
    <Box sx={{ width, height: height + 10, position: 'relative' }}>
      {isRecording ? (
        <>
          <canvas
            ref={canvasRef}
            width={width}
            height={height + 10}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: `${height}px`,
              left: 0,
              width: '100%',
              height: '10px',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            {markers.map(marker => (
              <Box
                key={marker.id}
                ref={el => (markerElementsRef.current[marker.id] = el)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-6px',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '10px solid black',
                  visibility: 'hidden',
                  willChange: 'transform',
                }}
              />
            ))}
          </Box>
        </>
      ) : audioBlob ? (
        <AudioVisualizer
          blob={audioBlob}
          mediaElement={mediaElement}
          width={width}
          height={height}
          barWidth={4}
          gap={2}
          barColor={waveColor}
          barPlayedColor={progressColor}
          style={{
            display: 'block',
            position: 'relative',
            cursor: showProgress ? 'pointer' : 'default',
          }}
          onPositionChange={showProgress ? handlePositionChange : undefined}
          options={{
            normalize: true,
            absoluteValue: true,
            blockHeight: height,
            baselineOffset: height,
          }}
        />
      ) : null}
    </Box>
  );
};

BlockWaveform.propTypes = {
  audioBlob: PropTypes.instanceOf(Blob),
  isRecording: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  waveColor: PropTypes.string,
  progressColor: PropTypes.string,
  showProgress: PropTypes.bool,
  onPositionChange: PropTypes.func,
  markers: PropTypes.array,
};

export default BlockWaveform; 