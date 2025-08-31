import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Inicio.css";

const Inicio: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: any };

  return (
    <div
      className="inicio-bg"
      style={{
        backgroundImage: "url('/bg-profesionales.png')",
        backgroundSize: "cover",
        backgroundPosition: "right center",
        minHeight: "100vh",
      }}
    >
      <div className="inicio-overlay">
        <div className="inicio-content">
          <img src="/logo.png" alt="Logo" className="inicio-logo" />
          <h1 className="inicio-title">TU SALUD ES NUESTRA PRIORIDAD</h1>
          <p className="inicio-desc">
            Contamos con un equipo de profesionales altamente calificados y una amplia gama de estudios médicos para garantizar diagnósticos precisos y tratamientos personalizados.
          </p>
          <div className="inicio-grid">
  <button className="inicio-btn" onClick={() => navigate("/solicitud-receta", { state })}>
    SOLICITAR RECETA
  </button>
  <button className="inicio-btn" onClick={() => navigate("/turnos", { state })}>
    TURNOS MÉDICOS
  </button>
  <button className="inicio-btn" onClick={() => navigate("/coberturas")}>
    COBERTURAS
  </button>
  <button className="inicio-btn" onClick={() => navigate("/contacto")}>
    CONTACTO
  </button>
  <button className="inicio-btn" onClick={() => navigate("/faq")}>
    AYUDA
  </button>
  <button className="inicio-btn" onClick={() => navigate("/settings")}>
    CONFIGURACIÓN
  </button>
</div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;