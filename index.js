const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware para manejar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));

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


// Ruta para generar el QR
app.post('/generate', (req, res) => {
  const { name, lastname, email, phone } = req.body;

  // URL de confirmación con nombre y apellido de la persona
  const confirmationUrl = `http://localhost:${port}/confirm?name=${encodeURIComponent(name)}&lastname=${encodeURIComponent(lastname)}`;

  // Generar el código QR
  QRCode.toDataURL(confirmationUrl, (err, qr) => {
    if (err) return res.send('Error al generar QR');

    // Mostrar QR y enlace de confirmación
    res.send(`
      <h2>QR generado para ${name} ${lastname}</h2>
      <p>Teléfono: ${phone}</p>
      <img src="${qr}" /><br>
      <a href="${confirmationUrl}">Página de confirmación</a>
    `);
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
