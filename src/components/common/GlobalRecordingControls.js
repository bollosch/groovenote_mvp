import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const GlobalRecordingControls = ({
  showDeleteDialog,
  setShowDeleteDialog,
  isRecording,
  setIsRecording,
  recordingTime,
  setRecordingTime,
  formatTime,
  recPosition,
  setRecPosition
}) => {
  // Handle recording button click/swipe
  const handleRecClick = () => {
    if (!isRecording) {
      setRecordingTime(0);
      setRecPosition("center");
      setTimeout(() => setIsRecording(true), 300);
    } else {
      setIsRecording(false);
      setRecPosition("right");
    }
  };

  // Restore the original styles and logic
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

      {/* Swipable Recording Button (half-visible when right) */}
      {!isRecording && (
        <Box
          onClick={handleRecClick}
          sx={{
            position: "absolute",
            bottom: 230,
            height: 220,
            width: "100%",
            display: "flex",
            justifyContent: recPosition === "right" ? "flex-start" : "center",
            alignItems: "center",
            transition: "all 0.3s ease-in-out",
            pointerEvents: isRecording ? "none" : "auto",
            pl: recPosition === "right" ? "calc(100% - 40px)" : 0,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: recPosition === "right" ? "50%" : 0,
              backgroundColor: "gray",
              cursor: "pointer",
            }}
          />
        </Box>
      )}

      {/* Recording Controls When Active */}
      {isRecording && (
        <Box
          sx={{
            position: "absolute",
            bottom: 234,
            height: 220,
            width: "100%",
            display: "flex",
            justifyContent: recPosition === "right" ? "flex-start" : "center",
            alignItems: "center",
            pl: recPosition === "right" ? "calc(100% - 40px)" : 0,
            pointerEvents: "auto",
          }}
        >
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
              onClick={handleRecClick}
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
      )}
    </>
  );
};

export default GlobalRecordingControls; 