import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute"; // Import the ProtectedRoute component
import { Dashboard } from "@mui/icons-material";
// import Home from "./pages/Home";
// import Article from "./pages/Article";
// import News from "./pages/News";
// import Vacancy from "./pages/Vacancy";
// import CACSGMA from "./pages/CACSGMA";
// import Download from "./pages/Download";
// import Query from "./pages/Query";
// import About from "./pages/About";
// import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/" element={<Dashboard />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/article" element={<Article />} />
          <Route path="/news" element={<News />} />
          <Route path="/vacancy" element={<Vacancy />} />
          <Route path="/cacsgma" element={<CACSGMA />} />
          <Route path="/download" element={<Download />} />
          <Route path="/query" element={<Query />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
