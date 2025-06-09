import React from 'react';
import { Box, Typography } from '@mui/material';

const DeleteRecordingDialog = ({ open, onConfirm, onCancel }) => {
  // Keep debug logging for development
  const handleConfirm = () => {
    console.log('[Debug] Delete confirmed - cleaning up recording');
    onConfirm();
  };

  const handleCancel = () => {
    console.log('[Debug] Delete cancelled - preserving recording state');
    onCancel();
  };

  return (
    <Box
      role="dialog"
      aria-labelledby="delete-dialog-title"
      sx={{
        position: "absolute",
        bottom: 300,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#fff",
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        zIndex: 10,
        textAlign: "center",
        display: open ? "block" : "none",
      }}
    >
      <Typography id="delete-dialog-title" mb={1}>Delete recording?</Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Typography
          role="button"
          tabIndex={0}
          sx={{ cursor: "pointer" }}
          onClick={handleCancel}
          onKeyDown={(e) => e.key === 'Enter' && handleCancel()}
        >
          no
        </Typography>
        <Typography
          role="button"
          tabIndex={0}
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={handleConfirm}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        >
          yes
        </Typography>
      </Box>
    </Box>
  );
};

export default DeleteRecordingDialog; 