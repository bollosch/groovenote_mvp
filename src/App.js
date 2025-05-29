/**
 * Main App Component for the GrooveNote MVP
 * This is a React-based music recording application with a mobile-first design
 * The app features four main screens: projects, folders, recording, and edit
 * utilizing Material-UI (MUI) for styling and components
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  createTheme,
  ThemeProvider,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ListIcon from "@mui/icons-material/List";
import DeleteIcon from "@mui/icons-material/Delete";
import SwipeableViews from "react-swipeable-views";

/**
 * Custom theme configuration
 * Sets Lato as the primary font family for consistent typography
 */
const theme = createTheme({
  typography: {
    fontFamily: "Lato, sans-serif",
  },
});

const App = () => {
  // State Management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);  // Controls visibility of delete confirmation dialog
  const [index, setIndex] = useState(3);  // Controls active tab/view (3 = edit view)
  const [isEditingTitle, setIsEditingTitle] = useState(false);  // Controls title edit mode
  const [title, setTitle] = useState("First Song");  // Stores current song title
  const [isRecording, setIsRecording] = useState(false);  // Tracks recording state
  const [recPosition, setRecPosition] = useState("right");  // Controls recording button position animation
  const [recordingTime, setRecordingTime] = useState(0);  // Tracks recording duration in seconds

  /**
   * Recording Timer Effect
   * Manages the recording timer when recording is active
   * Updates every second and cleans up on component unmount
   */
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  /**
   * Formats seconds into MM:SS display format
   * @param {number} seconds - The number of seconds to format
   * @returns {string} Formatted time string in MM:SS format
   */
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  /**
   * Handles recording button click events
   * Manages recording state and button position animations
   */
  const handleRecClick = () => {
    if (!isRecording) {
      setRecordingTime(0);  // Reset timer when starting new recording
      setRecPosition("center");  // Animate button to center
      setTimeout(() => setIsRecording(true), 300);
    } else {
      setIsRecording(false);
      setRecPosition("right");  // Return button to original position
    }
  };

  /**
   * Handles tab navigation
   * @param {number} i - The index of the tab to navigate to
   */
  const handleTabClick = (i) => {
    setIndex(i);
  };

  /**
   * Renders the header section for each screen
   * Includes title editing functionality for the edit screen
   * @param {string} screen - The current screen name ('edit', 'projects', 'folders', 'rec')
   * @returns {JSX.Element} Header component with appropriate controls
   */
  const renderHeader = (screen) => {
    const isEdit = screen === "edit";
    return (
      <Box
        sx={{
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          borderBottom: "2px solid #a55af4",
          flexShrink: 0,
        }}
      >
        {isEdit ? (
          isEditingTitle ? (
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              size="small"
              autoFocus
              variant="standard"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            />
          ) : (
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {title}
            </Typography>
          )
        ) : (
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {screen.charAt(0).toUpperCase() + screen.slice(1)}
          </Typography>
        )}

        {isEdit && (
          <Box>
            {isEditingTitle ? (
              <IconButton size="small" onClick={() => setIsEditingTitle(false)}>
                <CheckIcon />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={() => setIsEditingTitle(true)}>
                <EditIcon />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => alert("Settings")}>
              <SettingsIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  };

  /**
   * Renders the recording controls interface
   * This component manages the complete recording interface including:
   * 1. Delete Dialog: A modal dialog for confirming recording deletion
   * 2. Recording Controls Layout:
   *    - Set Marker Button: Allows adding markers during recording
   *    - Delete Button: Opens the delete confirmation dialog
   *    - Record Button: Main recording control
   *    - Timer Display: Shows current recording duration
   *    - New Project Option: Quick access to start a new project
   * 
   * The component's position and layout adapts based on the recording state
   * and uses absolute positioning for proper overlay on the main interface.
   * 
   * @returns {JSX.Element} Recording controls component with all interactive elements
   */
  const renderRecordingControls = () => (
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

      {/* Recording Controls Container - Manages layout and positioning */}
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
        {/* Recording Controls Column - Vertical stack of controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {/* Marker Setting Option */}
          <Typography sx={{ cursor: "pointer" }}>set marker</Typography>
          
          {/* Delete Recording Button */}
          <IconButton onClick={() => setShowDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
          
          {/* Main Recording Button */}
          <Box
            onClick={handleRecClick}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: "gray",
              cursor: "pointer",
            }}
          />
          
          {/* Recording Timer Display */}
          <Typography sx={{ mt: 1 }}>{formatTime(recordingTime)}</Typography>
          
          {/* New Project Option */}
          <Typography sx={{ cursor: "pointer" }}>start new project</Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      {/* Main Application Container */}
      <Box
        sx={{
          width: 402,
          height: 874,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          overflow: "hidden",
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Swipeable Views for Screen Navigation */}
          <SwipeableViews
            index={index}
            onChangeIndex={setIndex}
            style={{ flex: 1, height: "100%" }}
            containerStyle={{ height: "100%" }}
          >
            {/* Screen Mapping */}
            {["projects", "folders", "rec", "edit"].map((screen) => (
              <Box
                key={screen}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {renderHeader(screen)}

                {/* Edit Screen Content */}
                {screen === "edit" && (
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Waveform Visualization Area */}
                    <Box
                      sx={{
                        height: 120,
                        backgroundColor: "#ccc",
                        flexShrink: 0,
                      }}
                    />
                    {/* Track List Area */}
                    <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}>
                      {[...Array(6)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            height: 80,
                            backgroundColor: "#fff",
                            mb: 1,
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                    {/* Transport Controls Area */}
                    <Box
                      sx={{
                        height: 120,
                        backgroundColor: "#ccc",
                        flexShrink: 0,
                      }}
                    />
                    {/* Recording Button (when not recording) */}
                    {!isRecording && (
                      <Box
                        onClick={handleRecClick}
                        sx={{
                          position: "absolute",
                          bottom: 160,
                          height: 220,
                          width: "100%",
                          display: "flex",
                          justifyContent:
                            recPosition === "right" ? "flex-start" : "center",
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
                    {/* Recording Controls (when recording) */}
                    {isRecording && renderRecordingControls()}
                  </Box>
                )}

                {/* Recording Screen Content */}
                {screen === "rec" && (
                  <Box sx={{ flexGrow: 1, position: "relative" }}>
                    {/* Recording Button (when not recording) */}
                    {!isRecording && (
                      <Box
                        onClick={handleRecClick}
                        sx={{
                          position: "absolute",
                          bottom: 160,
                          right: recPosition === "right" ? -20 : "50%",
                          transform:
                            recPosition === "right"
                              ? "none"
                              : "translateX(50%)",
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          backgroundColor: "gray",
                          transition: "all 0.3s ease-in-out",
                          cursor: "pointer",
                        }}
                      />
                    )}
                    {/* Recording Controls (when recording) */}
                    {isRecording && renderRecordingControls()}
                  </Box>
                )}
              </Box>
            ))}
          </SwipeableViews>
        </Box>

        {/* Navigation Tab Bar */}
        <Box
          sx={{
            height: 60,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            borderTop: "1px solid #ccc",
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          {/* Projects Tab */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(0)}>
              <ListIcon color={index === 0 ? "primary" : "disabled"} />
            </IconButton>
            <Typography fontSize={10}>projects</Typography>
          </Box>
          {/* Folders Tab */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(1)}>
              <FolderOpenIcon color={index === 1 ? "primary" : "disabled"} />
            </IconButton>
            <Typography fontSize={10}>folders</Typography>
          </Box>
          {/* Record Tab */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(2)}>
              <RadioButtonCheckedIcon
                color={index === 2 ? "primary" : "disabled"}
              />
            </IconButton>
            <Typography fontSize={10}>rec</Typography>
          </Box>
          {/* Edit Tab */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(3)}>
              <EditIcon color={index === 3 ? "primary" : "disabled"} />
            </IconButton>
            <Typography fontSize={10}>edit</Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App; 