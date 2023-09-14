const Sequelize = require('sequelize');
const db = require('../db.js');


const Provincia = db.define('Provincia', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'nombre', 
    },
    isoNombre: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'iso_nombre', 
    },
    longitud: {
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'centroide_lon', 
    },
    latitud: {
      type: Sequelize.FLOAT,
      allowNull: false,
      field: 'centroide_lat', 
    },
  });
  
  module.exports = Provincia;
