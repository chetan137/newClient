import { createTheme } from "@mui/material/styles";

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Blue
    },
    background: {
      default: "#ffffff", // White
      paper: "#f5f5f5", // Light gray
    },
    text: {
      primary: "#000000", // Black
      secondary: "#333333", // Dark gray
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Light blue
    },
    background: {
      default: "#121212", // Dark gray
      paper: "#1e1e1e", // Darker gray
    },
    text: {
      primary: "#ffffff", // White
      secondary: "#cccccc", // Light gray
    },
  },
});
