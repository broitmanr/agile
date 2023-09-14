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

/**
 * Para crear una objeto moneda.
 * Parámetro data: JSON con los atributos de la moneda.
 *
 */
const createMoneda = ({
    name = '',
    sigla = '',
    simbolo = '',
} = {}) => {
    return Moneda.create({ name, sigla, simbolo })
};

/**
 * Buscar una moneda por ID.
 * Parámetro id: ID de la moneda a buscar.
 *
 */
const findMonedaById = (id) => {
    return Moneda.findByPk(id);
};

/**
 * Obtener todas las monedas.
 *
 */
const getAllMonedas = () => {
    return Moneda.findAll();
};

const MonedaModel = {
    Moneda: Moneda,
    create: createMoneda,
    findMonedaById: findMonedaById,
    getAllMonedas: getAllMonedas,
};

module.exports = MonedaModel;
