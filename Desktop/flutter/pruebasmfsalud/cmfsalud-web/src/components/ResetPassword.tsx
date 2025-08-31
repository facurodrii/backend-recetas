import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css"; // Reutiliza los estilos del login

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMensaje("Por favor, ingresa tu correo electrónico.");
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMensaje("Se ha enviado un enlace de restablecimiento a tu correo.");
      setTimeout(() => {
        setMensaje(null);
        navigate("/");
      }, 4000);
    } catch (e) {
      setMensaje("Error: " + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {/* Cartel flotante personalizado */}
      {mensaje && (
        <div className="alert-custom">
          {mensaje}
          <button onClick={() => setMensaje(null)} className="alert-close">X</button>
        </div>
      )}
      <form className="login-form" onSubmit={handleResetPassword}>
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <h2>Restablecer contraseña</h2>
        <input
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="login-input"
        />
        {isLoading ? (
          <div className="login-loading">Cargando...</div>
        ) : (
          <button type="submit" className="login-btn">
            Enviar enlace de restablecimiento
          </button>
        )}
        <button
          type="button"
          className="login-link"
          onClick={() => navigate("/")}
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;