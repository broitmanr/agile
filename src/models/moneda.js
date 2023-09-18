const Sequelize = require('sequelize');
const db = require('../db.js');

/**
 * Modelo de moneda
 *
 */
const Moneda = db.define(
    'Moneda',
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
        sigla: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        simbolo: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    { tableName: 'Moneda' }
);


module.exports = Moneda;
