const {Sequelize,Model} = require('sequelize');
const db = require('../db.js');

/**
 * Modelo de categoría
 */
class Categoria extends Model {}

Categoria.init({
        // Atributos
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        icono_fa:{
            type: Sequelize.STRING,
            allowNull:true,
        }
    },
    {sequelize: db, modelName: 'Categoria',timestamps:false}
);

module.exports = Categoria;
