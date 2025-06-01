/**
 * Main App Component for the GrooveNote MVP
 * This is a React-based music recording application with a mobile-first design
 * The app features three main screens: projects, folders, and edit
 * utilizing Material-UI (MUI) for styling and components
 */

import React, { useState, useEffect } from "react";
import { Box, ThemeProvider } from "@mui/material";
import SwipeableViews from "react-swipeable-views";

// Import components
import Header from "../components/common/Header";
import Navigation from "../components/navigation/Navigation";
import GlobalRecordingControls from "../components/common/GlobalRecordingControls";

// Import utils
import { formatTime } from "../utils/timeFormatter";
import theme from "../styles/theme";

const App = () => {
  // State Management
  const [index, setIndex] = useState(2); // Default to edit view since rec is removed
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("First Song");
  
  // Recording state will be moved to a global context later
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recPosition, setRecPosition] = useState("right");

  // Recording Timer Effect
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleTabClick = (i) => {
    setIndex(i);
  };

  return (
    <ThemeProvider theme={theme}>
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
          position: "relative", // Added for proper positioning of fixed elements
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <SwipeableViews
            index={index}
            onChangeIndex={setIndex}
            style={{ flex: 1, height: "100%" }}
            containerStyle={{ height: "100%" }}
          >
            {["collections", "projects", "edit"].map((screen) => (
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
                <Header
                  screen={screen}
                  title={title}
                  isEditingTitle={isEditingTitle}
                  setIsEditingTitle={setIsEditingTitle}
                  setTitle={setTitle}
                />

                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      backgroundColor: "#ccc",
                      flexShrink: 0,
                    }}
                  />
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
                  <Box
                    sx={{
                      height: 120,
                      backgroundColor: "#ccc",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </SwipeableViews>
        </Box>

        <Navigation index={index} handleTabClick={handleTabClick} />

        <GlobalRecordingControls
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordingTime={recordingTime}
          setRecordingTime={setRecordingTime}
          formatTime={formatTime}
          recPosition={recPosition}
          setRecPosition={setRecPosition}
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;