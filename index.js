const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
// CORS: permitir frontend local y dominios de prod
const allowedOrigins = [
  'http://localhost:3000',
  'https://cmfsalud-web.onrender.com',
  'https://cmfsalud.vercel.app',
];
app.use(cors({
  origin: function(origin, callback) {
    // permitir solicitudes sin origin (e.g. Postman) o si coincide con allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Manejo explícito de preflight
app.options('*', cors());

// No se requieren adjuntos: los endpoints reciben JSON

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saludcmf@gmail.com',
    pass: 'glpdffipzgzgmiag',
  },
});

// express.json para endpoints JSON
app.use(express.json());

// Ruta básica para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend CMF Salud funcionando correctamente',
    endpoints: ['/enviar-receta', '/enviar-turno'],
    timestamp: new Date().toISOString()
  });
});

// Solicitud de receta (ahora soporta varios medicamentos y observaciones)
app.post('/enviar-receta', async (req, res) => {
  try {
    const datos = req.body;
    console.log('Datos recibidos:', JSON.stringify(datos, null, 2));

    // Procesa array de medicamentos
    let medicamentosTexto = '';
    if (Array.isArray(datos.medicamentos)) {
      medicamentosTexto = datos.medicamentos.map((med, idx) => `
Medicamento ${idx + 1}:
- Nombre Genérico: ${med.nombreGenerico || "No especificado"}
- Nombre Comercial: ${med.nombreComercial || "No especificado"}
- Dosis: ${med.dosis || "No especificado"}
- Forma Farmacéutica: ${med.formaFarmaceutica || "No especificado"}
- Requerimiento Mensual: ${med.requerimientoMensual || "No especificado"} UNIDADES
`).join('\n');
    } else {
      // Compatibilidad con formato anterior (un solo medicamento)
      medicamentosTexto = `
- Nombre Genérico: ${datos.nombreGenerico || "No especificado"}
- Nombre Comercial: ${datos.nombreComercial || "No especificado"}
- Dosis: ${datos.dosis || "No especificado"}
- Forma Farmacéutica: ${datos.formaFarmaceutica || "No especificado"}
- Requerimiento Mensual: ${datos.requerimientoMensual || "No especificado"} UNIDADES
`;
    }

    const mailOptions = {
      from: 'saludcmf@gmail.com',
      to: 'saludcmf@gmail.com',
      subject: 'Nueva Solicitud de Receta',
  text: `
Datos del Paciente:
- Nombre: ${datos.nombrePaciente || "No especificado"}
- Apellido: ${datos.apellidoPaciente || "No especificado"}
- DNI: ${datos.dniPaciente || "No especificado"}
- Email: ${datos.emailPaciente || "No especificado"}
- Cobertura: ${datos.obraSocial || "No especificado"}
- N° de afiliado: ${datos.nroAfiliado || datos.numeroAfiliado || "No especificado"}

Solicitud de Receta:
${medicamentosTexto}

Observaciones: ${datos.observaciones || "Ninguna"}
`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email enviado correctamente');
    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ ok: false, error: error.toString() });
  }
});

// Solicitud de turno (JSON simple, sin archivos adjuntos)
app.post('/enviar-turno', async (req, res) => {
  try {
    const datos = req.body || {};
    console.log('Datos turno recibidos:', JSON.stringify(datos, null, 2));

    // Validación básica (sin archivo)
    if (!datos.nombrePaciente || !datos.apellidoPaciente || !datos.dniPaciente || !datos.emailPaciente || !datos.obraSocial) {
      return res.status(400).json({ ok: false, error: 'Faltan datos mínimos del paciente.' });
    }

    const especialidad = datos.especialidad || datos.tipoConsulta || 'No especificada';
    const fechaPreferida = datos.fecha || datos.fechaPreferida || 'No especificada';
    const horarioPreferido = datos.horario || datos.horarioPreferido || 'No especificado';
    const comentarios = datos.comentarios || datos.observaciones || 'Sin comentarios';

    const mailOptions = {
      from: 'saludcmf@gmail.com',
      to: 'saludcmf@gmail.com',
      subject: 'Nueva Solicitud de Turno',
      text: `
Datos del Paciente:
- Nombre: ${datos.nombrePaciente}
- Apellido: ${datos.apellidoPaciente}
- DNI: ${datos.dniPaciente}
- Email: ${datos.emailPaciente}
- Cobertura: ${datos.obraSocial}
- N° de afiliado: ${datos.nroAfiliado || datos.numeroAfiliado || 'No especificado'}

Solicitud de Turno:
- Especialidad/Tipo: ${especialidad}
- Fecha preferida: ${fechaPreferida}
- Horario preferido: ${horarioPreferido}
- Comentarios: ${comentarios}
`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de turno enviado correctamente');
    res.json({ ok: true, mensaje: 'Correo de turno enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar email de turno:', error);
    res.status(500).json({ ok: false, error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
