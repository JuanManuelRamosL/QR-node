const { Sequelize, DataTypes } = require('sequelize');

// Conexión a la base de datos PostgreSQL
const sequelize = new Sequelize('postgresql://qr_xvyw_user:knhHWw5z0rmWK26raYOEaK2O3stJGrkz@dpg-cs880968ii6s73c5mm70-a.oregon-postgres.render.com/qr_xvyw', {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,   // Render requiere SSL para conexiones a PostgreSQL
        rejectUnauthorized: false // Permitir certificados autofirmados
      }
    }
  });

// Definición del modelo para almacenar usuarios y el QR
const QRModel = sequelize.define('QR', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    confirmationUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qrImage: {
      type: DataTypes.TEXT,  // Guardar la imagen del QR en formato base64
      allowNull: false
    }
  }, {
    timestamps: true
  });
  
  // Sincronización del modelo con la base de datos (crea la tabla si no existe)
  sequelize.sync({ alter: true })  // Esto actualizará la tabla si hay diferencias
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });
  module.exports = { QRModel, sequelize };