const Sequelize = require('sequelize');
const db = require('../db.js');

/**
 * Modelo de Usuario
 *
 */
const Usu = db.define(
    'Usu',
    {
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
        apellido: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    { tableName: 'Usu' }
);


module.exports = Usu;