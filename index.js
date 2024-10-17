const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
// const { QRModel } = require('./db');  // Importamos el modelo y la conexión a la base de datos
const cors = require('cors');  // Importa el paquete cors
const app = express();
const port = 3000;

// Middleware para manejar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

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
  const confirmationUrl = `https://qr-node-juanmanuels-projects-d39dfb8d.vercel.app/confirm?name=${encodeURIComponent(name)}&lastname=${encodeURIComponent(lastname)}`;

  // Generar el código QR
  QRCode.toDataURL(confirmationUrl, async (err, qrImage) => {
    if (err) return res.send('Error al generar QR');

    try {
      // Guardar en la base de datos
      // const newQRRecord = await QRModel.create({
      //   name,
      //   lastname,
      //   email,
      //   phone,
      //   confirmationUrl,
      //   qrImage // Guardamos la imagen del QR como base64
      // });

      // Mostrar QR y enlace de confirmación
      res.send(`
        <h2>QR generado para ${name} ${lastname}</h2>
        <p>Teléfono: ${phone}</p>
        <img src="${qrImage}" /><br>
        <a href="${confirmationUrl}">Página de confirmación</a>
      `);
    } catch (error) {
      // console.error('Error al guardar en la base de datos', error);
      res.status(500).send('Error al generar el QR');
    }
  });
});

// Ruta de confirmación
app.get('/confirm', (req, res) => {
  const { name, lastname } = req.query;
  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
          }
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            font-size: 18px;
            margin-bottom: 10px;
          }
          .confirm-button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            font-size: 16px;
            transition: background-color 0.3s ease;
          }
          .confirm-button:hover {
            background-color: #45a049;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
          @media (max-width: 600px) {
            .container {
              padding: 15px;
              width: 90%;
            }
            h1 {
              font-size: 20px;
            }
            p {
              font-size: 16px;
            }
            .confirm-button {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Confirmación de entrada</h1>
          <p>Bienvenido/a, ${name} ${lastname}.</p>
          <p>¡Tu entrada ha sido confirmada exitosamente!</p>
          <a href="/" class="confirm-button">Volver al inicio</a>
          <div class="footer">
            <p>&copy; 2024 Confirmación de Eventos</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Nuevo endpoint para obtener todos los registros desde la base de datos
app.get('/users', async (req, res) => {
  try {
    // const users = await QRModel.findAll();
    // res.json(users);
    res.status(200).send('Datos no disponibles en este momento');
  } catch (err) {
    res.status(500).send('Error al obtener los datos');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
