/**
 * Main App Component for the GrooveNote MVP
 * This is a React-based music recording application with a mobile-first design
 * The app features four main screens: projects, folders, recording, and edit
 * utilizing Material-UI (MUI) for styling and components
 */

import React, { useState, useEffect } from "react";
import { Box, ThemeProvider } from "@mui/material";
import SwipeableViews from "react-swipeable-views";

// Import components
import Header from "../components/common/Header";
import Navigation from "../components/navigation/Navigation";
import RecordingControls from "../components/recording/RecordingControls";

// Import utils
import { formatTime } from "../utils/timeFormatter";
import theme from "../styles/theme";

const App = () => {
  // State Management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [index, setIndex] = useState(3);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("First Song");
  const [isRecording, setIsRecording] = useState(false);
  const [recPosition, setRecPosition] = useState("right");
  const [recordingTime, setRecordingTime] = useState(0);

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

  // Event Handlers
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
                <Header
                  screen={screen}
                  title={title}
                  isEditingTitle={isEditingTitle}
                  setIsEditingTitle={setIsEditingTitle}
                  setTitle={setTitle}
                />

                {screen === "edit" && (
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
                    
                    {isRecording && (
                      <RecordingControls
                        showDeleteDialog={showDeleteDialog}
                        setShowDeleteDialog={setShowDeleteDialog}
                        recPosition={recPosition}
                        isRecording={isRecording}
                        setIsRecording={setIsRecording}
                        setRecPosition={setRecPosition}
                        setRecordingTime={setRecordingTime}
                        recordingTime={recordingTime}
                        formatTime={formatTime}
                      />
                    )}
                  </Box>
                )}

                {screen === "rec" && (
                  <Box sx={{ flexGrow: 1, position: "relative" }}>
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
                    {isRecording && (
                      <RecordingControls
                        showDeleteDialog={showDeleteDialog}
                        setShowDeleteDialog={setShowDeleteDialog}
                        recPosition={recPosition}
                        isRecording={isRecording}
                        setIsRecording={setIsRecording}
                        setRecPosition={setRecPosition}
                        setRecordingTime={setRecordingTime}
                        recordingTime={recordingTime}
                        formatTime={formatTime}
                      />
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </SwipeableViews>
        </Box>

        <Navigation index={index} handleTabClick={handleTabClick} />
      </Box>
    </ThemeProvider>
  );
};

export default App;