import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ListIcon from '@mui/icons-material/List';

const Navigation = ({ index, handleTabClick }) => {
  return (
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
          <FolderOpenIcon color={index === 0 ? "primary" : "disabled"} />
        </IconButton>
        <Typography fontSize={10}>collections</Typography>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <IconButton onClick={() => handleTabClick(1)}>
          <ListIcon color={index === 1 ? "primary" : "disabled"} />
        </IconButton>
        <Typography fontSize={10}>projects</Typography>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <IconButton onClick={() => handleTabClick(2)}>
          <EditIcon color={index === 2 ? "primary" : "disabled"} />
        </IconButton>
        <Typography fontSize={10}>edit</Typography>
      </Box>
    </Box>
  );
};

export default Navigation; 