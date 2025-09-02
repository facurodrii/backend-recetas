import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import SolicitudReceta from "./components/SolicitudReceta.tsx";
import Turnos from "./components/Turnos.tsx";
import Settings from "./components/Settings.tsx";
import FAQ from "./components/FAQ.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Inicio from "./components/Inicio.tsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/inicio" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/solicitud-receta" 
            element={
              <ProtectedRoute>
                <SolicitudReceta />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/turnos" 
            element={
              <ProtectedRoute>
                <Turnos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faq" 
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
