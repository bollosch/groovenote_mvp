import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const RecordingControls = ({
  showDeleteDialog,
  setShowDeleteDialog,
  recPosition,
  isRecording,
  setIsRecording,
  setRecPosition,
  setRecordingTime,
  recordingTime,
  formatTime
}) => {
  return (
    <>
      {/* Delete Recording Confirmation Dialog */}
      <Box
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
          display: showDeleteDialog ? "block" : "none",
        }}
      >
        <Typography mb={1}>Delete recording?</Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Typography
            sx={{ cursor: "pointer" }}
            onClick={() => setShowDeleteDialog(false)}
          >
            no
          </Typography>
          <Typography
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={() => {
              setShowDeleteDialog(false);
              setIsRecording(false);
              setRecPosition("right");
              setRecordingTime(0);
            }}
          >
            yes
          </Typography>
        </Box>
      </Box>

      {/* Recording Controls Container */}
      <Box
        sx={{
          position: "absolute",
          bottom: 163,
          height: 220,
          width: "100%",
          display: "flex",
          justifyContent: recPosition === "right" ? "flex-start" : "center",
          alignItems: "center",
          pl: recPosition === "right" ? "calc(100% - 40px)" : 0,
          pointerEvents: "auto",
        }}
      >
        {/* Recording Controls Column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ cursor: "pointer" }}>set marker</Typography>
          
          <IconButton onClick={() => setShowDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
          
          <Box
            onClick={() => {
              setIsRecording(false);
              setRecPosition("right");
            }}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: "gray",
              cursor: "pointer",
            }}
          />
          
          <Typography sx={{ mt: 1 }}>{formatTime(recordingTime)}</Typography>
          
          <Typography sx={{ cursor: "pointer" }}>start new project</Typography>
        </Box>
      </Box>
    </>
  );
};

export default RecordingControls; 