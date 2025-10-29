import './index.css'; // or './styles.css' — make sure file is in src/
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CloudDashboard from "./pages/CloudDashboard";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<CloudDashboard />} />npx tailwindcss init
    </Routes>
  </Router>
);

export default App;
