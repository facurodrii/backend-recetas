import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css"; // Reutiliza los estilos del login

const coberturas = [
  "AMEBPBA", "AMFFA", "CASA", "CAJA DE SEGURIDAD SOCIAL PARA ESCRIBANOS DE LA PROVINCIA DE BUENOS AIRES",
  "CAJA NOTARIAL COMPLEMENTARIA DE SEGURIDAD SOCIAL", "CARDIOLOGÍA", "CONFERENCIA EPISCOPAL ARGENTINA",
  "DASMI", "DASUTEN", "FUNDACION COMEI", "IOMA", "JERARQUICOS SALUD", "MEDIFÉ", "MOA",
  "OPDEA", "OSAPM", "OSDE", "OSPEPBA", "OSPJN", "OSA", "OSETYA", "PAMI", "SADAIC",
  "SANCOR SALUD", "SWISS MEDICAL"
].sort();

function esContraseñaFuerte(password: string): boolean {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
}

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [obraSocialOtro, setObraSocialOtro] = useState("");
  const [nroAfiliado, setNroAfiliado] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const coberturaFinal = obraSocial === "Otro" ? obraSocialOtro : obraSocial;
    if (
      !nombre || !apellido || !dni || !fechaNacimiento || !telefono ||
      !coberturaFinal || !nroAfiliado || !email || !password
    ) {
      setMensaje("Por favor, completa todos los campos.");
      return;
    }
    if (!esContraseñaFuerte(password)) {
      setMensaje("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        telefono,
        obraSocial: coberturaFinal,
        nroAfiliado,
        email,
      });
      await sendEmailVerification(user);
      setMensaje("Usuario registrado correctamente. Te enviamos un correo de verificación. Por favor, verifica tu email antes de ingresar.");
      setTimeout(() => {
        setMensaje(null);
        navigate("/");
      }, 4000);
    } catch (e: any) {
      let mensajeError = "Error al registrar usuario.";
      if (e.code === "auth/email-already-in-use") {
        mensajeError = "El correo ingresado ya está registrado. Si olvidaste tu contraseña, puedes recuperarla desde el inicio de sesión.";
      }
      setMensaje(mensajeError);
    }
    setIsLoading(false);
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
      <form className="login-form" onSubmit={handleRegister}>
        <h2 style={{ textTransform: "uppercase", fontWeight: "bold", marginBottom: 24 }}>REGISTRO</h2>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={e => setDni(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          />
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={fechaNacimiento}
            onChange={e => setFechaNacimiento(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          />
        </div>
        <input
          type="tel"
          placeholder="Número telefónico de contacto"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          required
          className="login-input"
        />
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <select
            value={obraSocial}
            onChange={e => setObraSocial(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          >
            <option value="">Selecciona tu cobertura</option>
            {coberturas.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Otro">Otro</option>
          </select>
          {obraSocial === "Otro" && (
            <input
              type="text"
              placeholder="Especifica tu cobertura"
              value={obraSocialOtro}
              onChange={e => setObraSocialOtro(e.target.value)}
              required
              className="login-input"
              style={{ flex: 1 }}
            />
          )}
          <input
            type="text"
            placeholder="N° de afiliado"
            value={nroAfiliado}
            onChange={e => setNroAfiliado(e.target.value)}
            required
            className="login-input"
            style={{ flex: 1 }}
          />
        </div>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <small style={{ color: "#043A66", marginBottom: 10 }}>
          La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.
        </small>
        {isLoading ? (
          <div className="login-loading">Cargando...</div>
        ) : (
          <button type="submit" className="login-btn">Registrarse</button>
        )}
        <button
          type="button"
          className="login-link"
          onClick={() => navigate("/")}
        >
          Volver al login
        </button>
      </form>
    </div>
  );
};

export default Register;