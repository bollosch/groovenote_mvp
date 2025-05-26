import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  createTheme,
  ThemeProvider,
  TextField,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ListIcon from "@mui/icons-material/List";
import DeleteIcon from "@mui/icons-material/Delete";
import SwipeableViews from "react-swipeable-views";

const theme = createTheme({
  typography: {
    fontFamily: "Lato, sans-serif",
  },
});

const App = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [index, setIndex] = useState(3); // Start on "edit"
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("First Song");
  const [isRecording, setIsRecording] = useState(false);
  const [recPosition, setRecPosition] = useState("right");
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleRecClick = () => {
    if (!isRecording) {
      setRecordingTime(0); // Reset time on start
      setRecPosition("center");
      setTimeout(() => setIsRecording(true), 300);
    } else {
      setIsRecording(false);
      setRecPosition("right"); // zurück zum Startzustand
    }
  };

  const handleTabClick = (i) => {
    setIndex(i);
  };

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

  const renderRecordingControls = () => (
    <>
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
    </>
  );

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
                {renderHeader(screen)}

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
                    {isRecording && renderRecordingControls()}
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
                    {isRecording && renderRecordingControls()}
                  </Box>
                )}
              </Box>
            ))}
          </SwipeableViews>
        </Box>

        {/* TabBar */}
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
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(0)}>
              <ListIcon color={index === 0 ? "primary" : "disabled"} />
            </IconButton>
            <Typography fontSize={10}>projects</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(1)}>
              <FolderOpenIcon color={index === 1 ? "primary" : "disabled"} />
            </IconButton>
            <Typography fontSize={10}>folders</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <IconButton onClick={() => handleTabClick(2)}>
              <RadioButtonCheckedIcon
                color={index === 2 ? "primary" : "disabled"}
              />
            </IconButton>
            <Typography fontSize={10}>rec</Typography>
          </Box>
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