const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Middleware para manejar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar el transporte de Nodemailer (puedes usar Gmail, Outlook, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'matungoformulario@gmail.com', // Reemplaza con tu correo
    pass: '222989687Ee' // Reemplaza con tu contraseña o usa un App Password
  }
});

// Ruta para mostrar el formulario
app.get('/', (req, res) => {
  res.send(`
    <form action="/generate" method="POST">
      <label>Nombre: <input type="text" name="name" required /></label><br>
      <label>Apellido: <input type="text" name="lastname" required /></label><br>
      <label>Email: <input type="email" name="email" required /></label><br>
      <label>Teléfono: <input type="tel" name="phone" required /></label><br>
      <button type="submit">Generar QR</button>
    </form>
  `);
});

// Ruta para generar el QR y enviarlo por correo
app.post('/generate', (req, res) => {
  const { name, lastname, email, phone } = req.body;

  // URL de confirmación con el nombre y apellido de la persona
  const confirmationUrl = `http://localhost:${port}/confirm?name=${encodeURIComponent(name)}&lastname=${encodeURIComponent(lastname)}`;

  // Generar el código QR
  QRCode.toDataURL(confirmationUrl, (err, qr) => {
    if (err) return res.send('Error al generar QR');

    // Configurar el contenido del correo
    const mailOptions = {
      from: 'tu_correo@gmail.com', // Remitente
      to: email, // Receptor (el email del usuario)
      subject: 'Confirmación de entrada y código QR',
      text: `Hola ${name} ${lastname},\n\nAdjunto tu código QR para la confirmación de entrada.`,
      attachments: [{
        filename: 'qr.png',
        path: qr // Adjunta la imagen del QR como un archivo
      }]
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.send('Error al enviar el correo: ' + error);
      }
      res.send(`
        <h2>QR generado y enviado a ${email}</h2>
        <p>Teléfono: ${phone}</p>
        <img src="${qr}" /><br>
        <a href="${confirmationUrl}">Página de confirmación</a>
      `);
    });
  });
});

// Ruta de confirmación
app.get('/confirm', (req, res) => {
  const { name, lastname } = req.query;
  res.send(`<h1>Confirmación de entrada para ${name} ${lastname}</h1>`);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
