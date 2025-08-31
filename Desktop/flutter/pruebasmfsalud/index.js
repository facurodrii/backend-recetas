const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());

// Multer para archivos adjuntos (solo para /enviar-turno)
const upload = multer({ storage: multer.memoryStorage() });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saludcmf@gmail.com',
    pass: 'glpdffipzgzgmiag',
  },
});

// express.json SOLO para endpoints que reciben JSON
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
- N° de afiliado: ${datos.nroAfiliado || "No especificado"}

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

// Solicitud de turno (con adjunto, usa FormData)
app.post('/enviar-turno', upload.single('ordenMedica'), async (req, res) => {
  try {
    const datos = req.body;
    const archivo = req.file;
    
    console.log('Datos turno recibidos:', datos);
    console.log('Archivo recibido:', archivo ? archivo.originalname : 'No hay archivo');

    // Validación básica
    if (
      !datos.nombrePaciente ||
      !datos.apellidoPaciente ||
      !datos.dniPaciente ||
      !datos.emailPaciente ||
      !datos.obraSocial ||
      !datos.nroAfiliado ||
      !datos.especialidad ||
      !archivo
    ) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios.' });
    }

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
- N° de afiliado: ${datos.nroAfiliado}

Solicitud de Turno:
- Especialidad: ${datos.especialidad}
`,
      attachments: [{
        filename: archivo.originalname,
        content: archivo.buffer,
      }],
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
