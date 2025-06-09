import React, { useCallback, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAudioContext } from '../../context/AudioContext';
import DeleteRecordingDialog from './DeleteRecordingDialog';

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
    deleteRecording,
    restartRecording,
    recordingTime,
    recordingError,
    isPlaying,
    stop
  } = useAudioContext();



  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  // Handle restart recording (false start)
  const handleRestart = useCallback(async () => {
    try {
      console.log('[Debug] Restart clicked - marking current recording as false start');
      await restartRecording();
    } catch (error) {
      console.error('Restart recording failed:', error);
    }
  }, [restartRecording]);

  // Handle recording button click/swipe with error handling
  const handleRecClick = useCallback(async () => {
    try {
      if (!isRecording) {
        if (isPlaying) {
          stop();
        }
        setRecPosition("center");
        setTimeout(() => startRecording(), 300);
      } else {
        await stopRecording();
        setRecPosition("right");
      }
    } catch (error) {
      console.error('Recording action failed:', error);
      setRecPosition("right");
    }
  }, [isRecording, isPlaying, stop, startRecording, stopRecording, setRecPosition]);

  // Handle delete with proper cleanup
  const handleDelete = useCallback(async () => {
    try {
      console.log('[UI Debug] YES clicked - delete confirmed');
      await deleteRecording();
      
      // Update UI state
      if (onDelete) onDelete();
      setRecPosition("right");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete operation failed:', error);
      console.log('[UI Debug] Delete operation failed');
      setShowDeleteDialog(false);
    }
  }, [onDelete, setRecPosition, setShowDeleteDialog, deleteRecording]);

  // Handle cancel (no) in delete dialog
  const handleCancelDelete = useCallback(() => {
    console.log('[UI Debug] NO clicked - cancel delete');
    setShowDeleteDialog(false);
    if (isRecording) {
      console.log('[Debug] Recording is active - maintaining recording state');
    }
  }, [setShowDeleteDialog, isRecording]);

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
      <DeleteRecordingDialog
        open={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />

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
            // Adjust position of the recording controls when active
            bottom: 234 ,
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
            <IconButton onClick={() => { console.log('[Debug] Delete icon clicked - opening dialog'); setShowDeleteDialog(true); }}>
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
            
            {/* Restart Recording Button */}
            <Box
              onClick={handleRestart}
              sx={{
                position: "absolute",
                bottom: -112,
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "gray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                mt: 1,
                "&:hover": {
                  backgroundColor: "darkgray",
                }
              }}
            >
              <RestartAltIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default React.memo(GlobalRecordingControls); 