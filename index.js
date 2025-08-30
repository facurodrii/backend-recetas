const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());

// Multer para archivos adjuntos (solo para /enviar-turno)
const upload = multer({ storage: multer.memoryStorage() });

// express.json SOLO para endpoints que reciben JSON
app.use(express.json());

// Solicitud de receta (sin adjunto, usa JSON)
app.post('/enviar-receta', async (req, res) => {
  const datos = req.body;
  const mailOptions = {
    from: 'saludcmf@gmail.com',
    to: 'saludcmf@gmail.com',
    subject: 'Nueva Solicitud de Receta',
    text: `
Datos del Paciente:
- Nombre: ${datos.nombrePaciente}
- Apellido: ${datos.apellidoPaciente}
- DNI: ${datos.dniPaciente}
- Email: ${datos.emailPaciente}
- Cobertura: ${datos.obraSocial}
- N° de afiliado: ${datos.nroAfiliado}

Solicitud de Receta:
- Nombre Comercial: ${datos.nombreComercial}
- Dosis: ${datos.dosis}
- Forma Farmacéutica: ${datos.formaFarmaceutica}
- Requerimiento Mensual: ${datos.requerimientoMensual} UNIDADES
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.toString() });
  }
});

// Solicitud de turno (con adjunto, usa FormData)
app.post('/enviar-turno', upload.single('ordenMedica'), async (req, res) => {
  const datos = req.body; // Los campos llegan como strings
  const archivo = req.file;

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
