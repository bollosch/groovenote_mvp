import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

// Import specific visualizer implementations
import BlockWaveform from './BlockWaveform';
import EditWaveform from './EditWaveform';

const WaveformVisualizer = ({
  type = 'block', // 'block' or 'edit'
  audioBlob,
  isRecording,
  height = 100,
  width = '100%',
  backgroundColor = 'transparent',
  waveColor = '#1976d2',
  progressColor = '#90caf9',
  showProgress = true,
  onPositionChange,
  ...props
}) => {
  const renderWaveform = () => {
    switch (type) {
      case 'block':
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
            {...props}
          />
        );
      case 'edit':
        return (
          <EditWaveform
            audioBlob={audioBlob}
            height={height}
            width={width}
            waveColor={waveColor}
            progressColor={progressColor}
            showProgress={showProgress}
            onPositionChange={onPositionChange}
            {...props}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {renderWaveform()}
    </Box>
  );
};

WaveformVisualizer.propTypes = {
  type: PropTypes.oneOf(['block', 'edit']),
  audioBlob: PropTypes.instanceOf(Blob),
  isRecording: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  backgroundColor: PropTypes.string,
  waveColor: PropTypes.string,
  progressColor: PropTypes.string,
  showProgress: PropTypes.bool,
  onPositionChange: PropTypes.func,
};

export default WaveformVisualizer; 