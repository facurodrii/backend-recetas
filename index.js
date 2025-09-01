@"
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configura tu cuenta de Gmail aquí
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'saludcmf@gmail.com', // Tu correo de Gmail
    pass: 'glpdffipzgzgmiag',   // Tu contraseña de aplicación (sin espacios)
  },
});

app.post('/enviar-receta', async (req, res) => {
  const datos = req.body;
  
  // Procesar medicamentos - puede ser array o objeto individual
  let medicamentosTexto = '';
  
  if (datos.medicamentos && Array.isArray(datos.medicamentos)) {
    // Si es un array de medicamentos
    medicamentosTexto = datos.medicamentos.map((med, index) => `
Medicamento ${index + 1}:
- Nombre Genérico: ${med.nombreGenerico || 'No especificado'}
- Nombre Comercial: ${med.nombreComercial || 'No especificado'}
- Dosis: ${med.dosis || 'No especificado'}
- Forma Farmacéutica: ${med.formaFarmaceutica || 'No especificado'}
- Requerimiento Mensual: ${med.requerimientoMensual || 'No especificado'} UNIDADES
`).join('\n');
  } else {
    // Si es un medicamento individual (compatibilidad hacia atrás)
    medicamentosTexto = `
Medicamento:
- Nombre Genérico: ${datos.nombreGenerico || 'No especificado'}
- Nombre Comercial: ${datos.nombreComercial || 'No especificado'}
- Dosis: ${datos.dosis || 'No especificado'}
- Forma Farmacéutica: ${datos.formaFarmaceutica || 'No especificado'}
- Requerimiento Mensual: ${datos.requerimientoMensual || 'No especificado'} UNIDADES
`;
  }

  const mailOptions = {
    from: 'saludcmf@gmail.com',         // Remitente
    to: 'saludcmf@gmail.com',           // Destinatario
    subject: 'Nueva Solicitud de Receta',
    text: `
Datos del Paciente:
- Nombre: ${datos.nombrePaciente || 'No especificado'}
- Apellido: ${datos.apellidoPaciente || 'No especificado'}
- DNI: ${datos.dniPaciente || 'No especificado'}
- Email: ${datos.emailPaciente || 'No especificado'}
- Obra Social: ${datos.obraSocial || 'No especificado'}
- Número de Afiliado: ${datos.numeroAfiliado || 'No especificado'}

Solicitud de Receta:
${medicamentosTexto}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ ok: false, error: error.toString() });
  }
});

app.post('/enviar-turno', async (req, res) => {
  const datos = req.body;
  
  const mailOptions = {
    from: 'saludcmf@gmail.com',
    to: 'saludcmf@gmail.com',
    subject: 'Nueva Solicitud de Turno',
    text: `
Datos del Paciente:
- Nombre: ${datos.nombrePaciente || 'No especificado'}
- Apellido: ${datos.apellidoPaciente || 'No especificado'}
- DNI: ${datos.dniPaciente || 'No especificado'}
- Email: ${datos.emailPaciente || 'No especificado'}
- Teléfono: ${datos.telefonoPaciente || 'No especificado'}
- Obra Social: ${datos.obraSocial || 'No especificado'}
- Número de Afiliado: ${datos.numeroAfiliado || 'No especificado'}

Detalles del Turno:
- Tipo de Consulta: ${datos.tipoConsulta || 'No especificado'}
- Fecha Preferida: ${datos.fechaPreferida || 'No especificado'}
- Horario Preferido: ${datos.horarioPreferido || 'No especificado'}
- Comentarios: ${datos.comentarios || 'Sin comentarios'}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, mensaje: 'Solicitud de turno enviada correctamente' });
  } catch (error) {
    console.error('Error enviando email de turno:', error);
    res.status(500).json({ ok: false, error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
"@ | Out-File -FilePath index.js -Encoding UTF8
