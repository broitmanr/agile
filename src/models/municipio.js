const {Sequelize,Model,DataTypes} = require('sequelize');
const db = require('../db.js');
const Provincia = require('./provincia.js')


class Municipio extends Model {}

Municipio.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'nombre',
    },
    longitud: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'centroide_lon',
    },
    latitud: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'centroide_lat',
    },
    provincia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'provincia_id',
      references: {
        model: Provincia,
        key: 'id',
      },
    }
  },{
    sequelize:db,
    modelName:'Municipio',
    tableName: 'Municipio',
});

function findAll() {
    return Municipio.findAll();
}

  module.exports = {
    Municipio: Municipio,
      findAll: findAll,
  };
