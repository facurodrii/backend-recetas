const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configura tu cuenta de Gmail aquí
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saludcmf@gmail.com', // Tu correo de Gmail
    pass: 'glpdffipzgzgmiag',   // Tu contraseña de aplicación (sin espacios)
  },
});

app.post('/enviar-receta', async (req, res) => {
  const datos = req.body;
  const mailOptions = {
    from: 'saludcmf@gmail.com',         // Remitente
    to: 'saludcmf@gmail.com',           // Destinatario
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

app.post('/enviar-turno', async (req, res) => {
  const datos = req.body;
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

Solicitud de Turno:
- Especialidad: ${datos.especialidad}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, mensaje: 'Correo de turno enviado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.toString() });
  }
});
