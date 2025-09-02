import React, { useState } from 'react';
import { auth } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const navigate = useNavigate();

  const faqData: FAQItem[] = [
    {
      question: "¿Cómo puedo solicitar una receta médica?",
      answer: "Para solicitar una receta, inicia sesión en tu cuenta, ve a 'Solicitar Receta', completa el formulario con tus datos de contacto y selecciona los medicamentos que necesitas. Nuestro equipo procesará tu solicitud y te contactará para coordinar la entrega."
    },
    {
      question: "¿Cuánto tiempo demora la entrega de medicamentos?",
      answer: "El tiempo de entrega depende de tu ubicación y disponibilidad de los medicamentos. Generalmente, las entregas se realizan dentro de las 24-48 horas hábiles después de procesar tu solicitud."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos efectivo, tarjetas de débito y crédito, y transferencias bancarias. El pago se realiza al momento de la entrega de los medicamentos."
    },
    {
      question: "¿Cómo solicito un turno médico?",
      answer: "Ve a la sección 'Solicitar Turno', selecciona la especialidad médica que necesitas, tu fecha y horario preferido, y completa el formulario. Nuestro equipo se contactará contigo para confirmar la disponibilidad."
    },
    {
      question: "¿Trabajan con obra social?",
      answer: "Sí, trabajamos con las principales obras sociales del país incluyendo OSDE, Swiss Medical, Galeno, Medicus, IOMA, PAMI y muchas otras. También atendemos pacientes particulares."
    },
    {
      question: "¿Puedo modificar o cancelar mi solicitud?",
      answer: "Sí, puedes modificar o cancelar tu solicitud contactándote con nuestro equipo de atención al cliente antes de que sea procesada. Una vez que los medicamentos estén en camino, la modificación puede no ser posible."
    },
    {
      question: "¿Qué hago si tengo problemas con mi cuenta?",
      answer: "Si tienes problemas para acceder a tu cuenta o necesitas cambiar tu contraseña, ve a la sección 'Configuración'. Si el problema persiste, contacta a nuestro soporte técnico."
    },
    {
      question: "¿Los medicamentos requieren receta médica?",
      answer: "Algunos medicamentos requieren receta médica válida. Nuestro equipo verificará la documentación necesaria antes de procesar tu solicitud. Si no tienes receta, podemos ayudarte a coordinar una consulta médica."
    },
    {
      question: "¿Realizan entregas los fines de semana?",
      answer: "Realizamos entregas de lunes a viernes en horario comercial. Para urgencias durante fines de semana, contamos con un servicio especial - contacta a nuestro número de emergencia."
    },
    {
      question: "¿Cómo puedo contactar con atención al cliente?",
      answer: "Puedes contactarnos por email a contacto@cmfsalud.com, por teléfono al (011) 4000-0000, o a través del formulario de contacto en nuestra aplicación."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="faq-container">
      <nav className="navbar">
        <h1>CMF Salud</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/solicitud-receta')}>Solicitar Receta</button>
          <button onClick={() => navigate('/turnos')}>Solicitar Turno</button>
          <button onClick={() => navigate('/settings')}>Configuración</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </nav>

      <div className="faq-content">
        <h2>Preguntas Frecuentes (FAQ)</h2>
        
        <div className="faq-intro">
          <p>Encuentra respuestas a las preguntas más comunes sobre nuestros servicios. Si no encuentras lo que buscas, no dudes en contactarnos.</p>
        </div>

        <div className="faq-list">
          {faqData.map((item, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question"
                onClick={() => toggleItem(index)}
              >
                <h3>{item.question}</h3>
                <span className={`faq-icon ${openItems.includes(index) ? 'open' : ''}`}>
                  ▼
                </span>
              </div>
              
              {openItems.includes(index) && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="contact-info">
          <h3>¿Necesitas más ayuda?</h3>
          <p>Si no encontraste la respuesta que buscabas, puedes contactarnos:</p>
          <ul>
            <li>Email: contacto@cmfsalud.com</li>
            <li>Teléfono: (011) 4000-0000</li>
            <li>WhatsApp: +54 9 11 0000-0000</li>
            <li>Horario de atención: Lunes a Viernes de 8:00 a 20:00</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
