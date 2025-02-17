import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  Box,
} from "@mui/material";
import {
  MenuOutlined,
  Brightness4,
  Brightness7,
  ArrowDropDown,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeProvider";
import { Drawer } from "antd"; // ✅ Ant Design for better sidebar

const Navbar: React.FC = () => {
  const { auth, setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:900px)"); // ✅ Responsive check

  // State for sidebar menu
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articleAnchorEl, setArticleAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [vacancyAnchorEl, setVacancyAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [cacsAnchorEl, setCacsAnchorEl] = useState<null | HTMLElement>(null);

  // Toggle Sidebar Menu
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  // **Navigation Buttons**
  const navLinks = [
    { label: "News & Updates", path: "/news-updates" },
    { label: "Download", path: "/download" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Services", path: "/services" },
  ];

  return (
    <>
      {/* ✅ Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: "100vw",
          background: "rgba(255, 255, 255, 0.8)", // Blur white background
          backdropFilter: "blur(20px)", // Blur effect
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* ✅ Hamburger Menu Icon (Mobile) */}
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
              <MenuOutlined />
            </IconButton>
          )}

          {/* ✅ Brand Name */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              color: "#000",
              textDecoration: "none",
            }}
            component={Link} // ✅ Use Link as a component
            to="/dashboard" // ✅ Navigate to the dashboard on click
          >
            GA Article
          </Typography>

          {/* ✅ Theme Toggle Button */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {theme === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* ✅ Desktop Navigation (Hidden on Mobile) */}
          {!isMobile && (
            <Box>
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  color="inherit"
                  sx={{ color: "#000" }}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </Button>
              ))}

              {/* ✅ Dropdown Menus */}
              <Button
                color="inherit"
                sx={{ color: "#000" }}
                onClick={(e) => setArticleAnchorEl(e.currentTarget)}
              >
                Article <ArrowDropDown />
              </Button>
              <Menu
                anchorEl={articleAnchorEl}
                open={Boolean(articleAnchorEl)}
                onClose={() => setArticleAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate("/article/news")}>
                  News & Update
                </MenuItem>
                <MenuItem onClick={() => navigate("/article/submission")}>
                  Submission Procedure
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                sx={{ color: "#000" }}
                onClick={(e) => setVacancyAnchorEl(e.currentTarget)}
              >
                Vacancy <ArrowDropDown />
              </Button>
              <Menu
                anchorEl={vacancyAnchorEl}
                open={Boolean(vacancyAnchorEl)}
                onClose={() => setVacancyAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate("/vacancy/jobs")}>
                  Jobs
                </MenuItem>
                <MenuItem onClick={() => navigate("/vacancy/apply")}>
                  Apply
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                sx={{ color: "#000" }}
                onClick={(e) => setCacsAnchorEl(e.currentTarget)}
              >
                CA/CS/CMA <ArrowDropDown />
              </Button>
              <Menu
                anchorEl={cacsAnchorEl}
                open={Boolean(cacsAnchorEl)}
                onClose={() => setCacsAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate("/cacs/courses")}>
                  Courses
                </MenuItem>
                <MenuItem onClick={() => navigate("/cacs/exams")}>
                  Exams
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* ✅ Auth Buttons */}
          {auth ? (
            <Button
              color="inherit"
              sx={{ color: "#000" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                sx={{ color: "#000" }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                color="inherit"
                sx={{ color: "#000" }}
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* ✅ Mobile Sidebar Menu */}
      <Drawer
        title="Menu"
        placement="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
      >
        {navLinks.map((link) => (
          <Button
            key={link.label}
            sx={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </Button>
        ))}
        <Button
          sx={{ width: "100%", justifyContent: "flex-start" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Drawer>
    </>
  );
};

export default Navbar;
