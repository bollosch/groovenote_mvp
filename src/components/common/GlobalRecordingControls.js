import React, { useCallback, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAudioContext } from '../../context/AudioContext';

const GlobalRecordingControls = ({
  showDeleteDialog,
  setShowDeleteDialog,
  formatTime,
  recPosition,
  setRecPosition,
  onDelete,
  onNewProject
}) => {
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    recordingTime,
    recordingError 
  } = useAudioContext();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  // Handle recording button click/swipe with error handling
  const handleRecClick = useCallback(async () => {
    try {
      if (!isRecording) {
        setRecPosition("center");
        setTimeout(() => startRecording(), 300);
      } else {
        await stopRecording();
        setRecPosition("right");
      }
    } catch (error) {
      console.error('Recording action failed:', error);
      // Reset UI state on error
      setRecPosition("right");
    }
  }, [isRecording, startRecording, stopRecording, setRecPosition]);

  // Handle delete with proper cleanup
  const handleDelete = useCallback(() => {
    if (onDelete) onDelete();
    setRecPosition("right");
    setShowDeleteDialog(false);
  }, [onDelete, setRecPosition, setShowDeleteDialog]);

  // If there's a recording error, only show the error message
  if (recordingError) {
    return (
      <Typography 
        color="error" 
        sx={{ 
          position: "absolute", 
          bottom: 400, 
          left: "50%", 
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          textAlign: "center",
          maxWidth: "80%"
        }}
      >
        {recordingError}
        <Typography
          component="div"
          sx={{ 
            color: "primary.main", 
            cursor: "pointer",
            mt: 1,
            fontSize: "0.9em",
            "&:hover": {
              textDecoration: "underline"
            }
          }}
          onClick={() => window.location.reload()}
        >
          Tap to retry
        </Typography>
      </Typography>
    );
  }

  return (
    <>
      {/* Delete Recording Confirmation Dialog */}
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
          display: showDeleteDialog ? "block" : "none",
        }}
      >
        <Typography id="delete-dialog-title" mb={1}>Delete recording?</Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Typography
            role="button"
            tabIndex={0}
            sx={{ cursor: "pointer" }}
            onClick={() => setShowDeleteDialog(false)}
            onKeyPress={(e) => e.key === 'Enter' && setShowDeleteDialog(false)}
          >
            no
          </Typography>
          <Typography
            role="button"
            tabIndex={0}
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={handleDelete}
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
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
            <Typography 
              sx={{ cursor: "pointer" }}
              onClick={onNewProject}
            >
              start new project
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default React.memo(GlobalRecordingControls); 