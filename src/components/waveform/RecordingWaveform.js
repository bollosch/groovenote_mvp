import React from 'react';
import PropTypes from 'prop-types';
import BlockWaveform from './BlockWaveform';
import { useAudioContext } from '../../context/AudioContext';

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
  const { markers } = useAudioContext();
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
      markers={markers}
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