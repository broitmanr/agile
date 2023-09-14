const Sequelize = require('sequelize');
const db = require('../db.js');
const Municipio = require('./municipio.js')


const Localidad = db.define('Localidad', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'nombre', // El nombre de la columna en la base de datos
    },
    longitud: {
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'centroide_lon', // El nombre de la columna en la base de datos
    },
    latitud: {
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'centroide_lat', // El nombre de la columna en la base de datos
    },
    municipio: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'municipio_id', // El nombre de la columna en la base de datos
      references: {
        model: Municipio, // Nombre del modelo de destino (en este caso, el modelo de Municipio)
        key: 'id', // Nombre de la columna a la que se hace referencia en la tabla de Municipio
      },
    },
  }
  );
  
  module.exports = Localidad;
