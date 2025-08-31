import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Inicio";
import SolicitudReceta from "./components/SolicitudReceta";
import Turnos from "./components/Turnos";
import Settings from "./components/Settings";
import FAQ from "./components/FAQ";

// Componente wrapper para pasar userData desde location.state
function SolicitudRecetaWrapper() {
  const location = useLocation();
  return <SolicitudReceta userData={location.state || {}} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/solicitud-receta" element={<SolicitudRecetaWrapper />} />
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </Router>
  );
}

export default App;