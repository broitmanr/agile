const Sequelize = require('sequelize');
const db = require('../db.js');
const { Product } = require('./product.js');

/**
 * Modelo de categoría
 */
const Categoria = db.define(
    'Categoria',
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
    },
    { tableName: 'Categoria' }
);


/**
 * Crear una categoría nueva.
 * Parámetro data: JSON con los atributos de la categoría.
 */
const createCategoria = ({ nombre = '' } = {}) => {
    return Categoria.create({ nombre });
};

module.exports = { Categoria, createCategoria };
