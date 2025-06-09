import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// This is a placeholder component that will be replaced with a wavesurfer.js implementation
const EditWaveform = ({
  audioBlob,
  height,
  width,
  waveColor,
  progressColor,
  showProgress,
  onPositionChange,
}) => {
  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed grey',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        Edit Waveform (Coming Soon)
      </Typography>
    </Box>
  );
};

EditWaveform.propTypes = {
  audioBlob: PropTypes.instanceOf(Blob),
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  waveColor: PropTypes.string,
  progressColor: PropTypes.string,
  showProgress: PropTypes.bool,
  onPositionChange: PropTypes.func,
};

export default EditWaveform; 