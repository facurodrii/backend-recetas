import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMensaje("Por favor, completa todos los campos.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Validar email verificado
      if (!user.emailVerified) {
        setMensaje("Debes verificar tu correo antes de ingresar. Revisa tu bandeja de entrada.");
        setIsLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData) {
        navigate("/home", { state: userData });
      } else {
        setMensaje("No se encontraron datos del usuario.");
      }
    } catch (e) {
      setMensaje("Error al iniciar sesión. Verifica tus credenciales.");
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
      <form className="login-form" onSubmit={handleLogin}>
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <input
          type="email"
          placeholder="Ingresa tu usuario"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="login-input"
        />
        {isLoading ? (
          <div className="login-loading">Cargando...</div>
        ) : (
          <button type="submit" className="login-btn">Iniciar sesión</button>
        )}
        <button
          type="button"
          className="login-link"
          onClick={() => navigate("/reset-password")}
        >
          ¿Olvidaste tu contraseña?
        </button>
        <button
          type="button"
          className="login-link"
          onClick={() => navigate("/register")}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Login;