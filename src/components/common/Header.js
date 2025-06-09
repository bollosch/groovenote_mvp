import React from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';

const Header = ({ 
  screen, 
  title, 
  isEditingTitle, 
  setIsEditingTitle, 
  setTitle 
}) => {
  const isEdit = screen === "edit";

  return (
    <Box
      sx={{
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        borderBottom: "2px solid #1976d2",
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
          {(screen === "projects" || screen === "collections") ? screen : screen.charAt(0).toUpperCase() + screen.slice(1)}
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

export default Header; 