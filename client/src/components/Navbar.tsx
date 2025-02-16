import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import { MenuOutlined, Brightness4, Brightness7 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeProvider"; // Import useTheme

const Navbar: React.FC = () => {
  const { auth, setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setAuth(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{ width: "100vw", background: theme === "dark" ? "#121212" : "#333" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuOutlined />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          GA Article
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {theme === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {auth ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate("/signup")}>
              Signup
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
