const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
// const { QRModel } = require('./db');  // Importamos el modelo y la conexión a la base de datos
const cors = require('cors');  // Importa el paquete cors
const app = express();
const port = 3000;
const { Pool } = require('pg');
// Middleware para manejar datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 
const pool = new Pool({
  connectionString: 'postgresql://qr_xvyw_user:knhHWw5z0rmWK26raYOEaK2O3stJGrkz@dpg-cs880968ii6s73c5mm70-a.oregon-postgres.render.com/qr_xvyw',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar con la base de datos:', err);
  }
  console.log('Conexión exitosa a PostgreSQL');
  release();  // liberar el cliente
});

// Crear tabla "QR" si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS "QR" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    "confirmationUrl" TEXT,
    "qrImage" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

// Ejecutar la creación de la tabla si no existe
pool.query(createTableQuery)
  .then(() => {
    console.log('Tabla "QR" verificada/creada');
  })
  .catch((error) => {
    console.error('Error al crear la tabla:', error);
  });
// Ruta para mostrar el formulario
app.get('/', (req, res) => {
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
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            color: #4CAF50;
            font-size: 28px;
            margin-bottom: 20px;
          }
          form {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          label {
            margin-bottom: 10px;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 300px;
          }
          input {
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            width: 100%;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #45a049;
          }
          @media (max-width: 600px) {
            .container {
              padding: 20px;
              width: 90%;
            }
            label {
              font-size: 14px;
            }
            input {
              padding: 8px;
            }
            button {
              font-size: 14px;
              padding: 8px 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Generar Código QR</h1>
          <form action="/generate" method="POST">
            <label>Nombre: <input type="text" name="name" required /></label>
            <label>Apellido: <input type="text" name="lastname" required /></label>
            <label>Email: <input type="email" name="email" required /></label>
            <label>Teléfono: <input type="tel" name="phone" required /></label>
            <button type="submit">Generar QR</button>
          </form>
        </div>
      </body>
    </html>
  `);
});


// Ruta para generar el QR
app.post('/generate', (req, res) => {
  const { name, lastname, email, phone } = req.body;

  const confirmationUrl = `https://qr-node-juanmanuels-projects-d39dfb8d.vercel.app/confirm?name=${encodeURIComponent(name)}&lastname=${encodeURIComponent(lastname)}`;

  QRCode.toDataURL(confirmationUrl, async (err, qrImage) => {
    if (err) return res.send('Error al generar QR');

    try {
      const query = `
        INSERT INTO "QR" (name, lastname, email, phone, "confirmationUrl", "qrImage", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *;
      `;
      const values = [name, lastname, email, phone, confirmationUrl, qrImage];

      const result = await pool.query(query, values);
      console.log('Registro insertado:', result.rows[0]);  // Mostrar el registro insertado
      res.send(`
        <html>
          <head>
            <title>QR Generado</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              h2 {
                color: #333;
              }
              p {
                font-size: 16px;
                color: #666;
              }
              img {
                margin: 20px 0;
                border: 2px solid #ddd;
                border-radius: 8px;
                max-width: 100%;
                height: auto;
              }
              a {
                display: inline-block;
                padding: 10px 15px;
                margin-top: 15px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s;
              }
              a:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>QR generado para ${name} ${lastname}</h2>
              <p>Teléfono: ${phone}</p>
              <img src="${qrImage}" alt="QR Code" />
              <br>
              <a href="${confirmationUrl}">Página de confirmación</a>
            </div>
          </body>
        </html>
      `);
      
    } catch (error) {
      console.error('Error al guardar en la base de datos:', error);
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-image: url('/PORTADA1.jpg');
            background-size: cover;
            background-position: center;
          }
          .container {
            background-color: rgba(255, 255, 255, 0.85); /* Fondo blanco con transparencia */
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            width: 450px; /* Aumentado el ancho */
            border: 3px solid #FFD700; /* Borde dorado premium */
          }
          h1 {
            color: #333;
            font-size: 36px; /* Aumentado el tamaño de la fuente */
            margin-bottom: 30px;
            font-weight: bold;
          }
          p {
            font-size: 22px; /* Aumentado el tamaño de la fuente */
            margin-bottom: 20px;
          }
          .confirm-button {
            background-color: #FFD700; /* Botón dorado premium */
            color: #fff;
            padding: 18px 36px; /* Aumentado el tamaño del botón */
            border: none;
            border-radius: 10px;
            cursor: pointer;
            text-decoration: none;
            font-size: 20px; /* Aumentado el tamaño de la fuente */
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }
          .confirm-button:hover {
            background-color: #DAA520;
            transform: scale(1.05);
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #777;
          }
          @media (max-width: 600px) {
            .container {
              width: 90%;
              padding: 40px;
            }
            h1 {
              font-size: 28px;
            }
            p {
              font-size: 18px;
            }
            .confirm-button {
              font-size: 16px;
              padding: 14px 28px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Avant Premiere</h1>
          <p>Bienvenido/a, <strong>${name} ${lastname}</strong>.</p>
          <p>Tu entrada ha sido confirmada exitosamente.</p>
          
          <div class="footer">
            <p>&copy; 2024 Confirmación de Eventos</p>
          </div>
        </div>
      </body>
    </html>
  `);
});


// Nuevo endpoint para obtener todos los registros desde la base de datos
// Nuevo endpoint para obtener todos los registros desde la base de datos usando Pool
app.get('/users', async (req, res) => {
  try {
    const query = 'SELECT * FROM "QR"';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los datos:', err);
    res.status(500).send('Error al obtener los datos');
  }
});

// Ruta para eliminar un usuario por ID
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM "QR" WHERE id = $1 RETURNING *;';
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send('Usuario no encontrado');
    }

    res.send(`Usuario con ID ${id} eliminado exitosamente`);
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
