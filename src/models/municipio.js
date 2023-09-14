const Sequelize = require('sequelize');
const db = require('../db.js');
const Provincia = require('./provincia.js')


const Municipio = db.define('Municipio', {
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
    provincia: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'provincia_id', 
      references: {
        model: Provincia, 
        key: 'id', 
      },
    }
  });
  
  module.exports = Municipio;
