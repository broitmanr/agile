
const {Sequelize, Model, DataTypes} = require('sequelize');

const db = require('../db.js');
const Categoria = require('./categoria.js'); // Importa el modelo de Categoria
const Moneda = require('./moneda.js'); // Importa el modelo de Moneda
const Localidad = require('./localidad.js'); // Importa el modelo de Localidad
const dd = require('dump-die');
const sequelize = require('../db.js');

class Product extends Model {}

Product.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    categoria_id: {
        field: 'categoria_id',
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Categoria,
            key: 'id',
        },
    },
    precio: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    moneda_id: {
            field:'moneda_id',
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
            model: Moneda,
            key: 'id',
        },
    },
    marca: {
        type: Sequelize.STRING,
    },
    localidad_id: {
            field:'localidad_id',
            type: Sequelize.BIGINT,
            references: {
            model: Localidad,
            key: 'id',
        },
    },
    detalle: {
        type: Sequelize.TEXT, // Cambiamos a TEXT para soportar nvarchar(MAX)
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
},
{sequelize: db, modelName: 'Product', tableName: 'Producto'}
);

Product.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Product.belongsTo(Moneda, { foreignKey: 'moneda_id', as: 'moneda' });
Product.belongsTo(Localidad, { foreignKey: 'localidad_id', as: 'localidad' });
/**
 * Obtener todos los productos de la base de datos.
 *
 */
const getAllProducts = (limit, skip, type) => {
    let where = {};

    if (type) {
        where = {
            ...where,
            type: type,
        };
    }

    return Product.findAndCountAll({
        limit: limit,
        offset: skip,
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include:'categoria',
        where: where,
        // Agregamos la instrucción para que la lista venga ordenada directamente para toda la app
        order: [
            ['nombre', 'ASC'],
            ['precio', 'ASC'],
        ],
    });
};

/**
 * Busca un producto por id
 *
 */
function findById(id) {
    return Product.findOne({ 
        where: { id: id },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [
            // Incluye la relación 'categoria' y muestra solo el campo 'nombre'
            { model: Categoria, as: 'categoria', attributes: ['nombre'] },

            // Incluye la relación 'moneda' y muestra solo el campo 'nombre'
            { model: Moneda, as: 'moneda', attributes: ['simbolo', 'sigla'] },

            // Incluye la relación 'localidad' y muestra solo el campo 'nombre'
            { model: Localidad, as: 'localidad', attributes: ['nombre'] }
        ]
    })
}

 /**   
 * Busca un producto por nombre
 *
 *
 */

const searchProductsByName = async (productName) => {
    let where = {};
    if (productName) {
        where = {
            nombre: {
                [Sequelize.Op.like]: `%${productName}%`,
            },
        };
    }

    return Product.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: 'categoria',
        where: where,
        order: [
            ['nombre', 'ASC'],
            ['precio', 'ASC'],
        ],
    });
};

/**
 * Obtener todos los productos con descuento de la base de datos.
 *
 */
const getDiscountProducts = () => {
    return Product.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        where: {
            discount: {
                [Sequelize.Op.gt]: 0,
            },
        },
    });
};


const getMonedas = async() => {
    return await Moneda.findAll({
        attributes: ['sigla']
    });
};

/**
 * Crear un producto nuevo.
 * Parámetro data: JSON con los atributos a crear.
 *
 */

const createProduct = async(productData) => {
    const { nombre, categoria_id, precio, moneda_id, localidad_id } = productData;
    const categoria = await Categoria.findOne({ where: { nombre: categoria_id }, attributes: ['id'] }); //Para identificar el id del nombre de la categoria ingresada
    const moneda = await Moneda.findOne({ where: { sigla: moneda_id }, attributes: ['id'] }); //Para identificar el id de la sigla de la moneda ingresada
    const localidad = await Localidad.findOne({ where: { nombre: localidad_id }, attributes: ['id'] }); //Para identificar el id del nombre de la localidad ingresada
    const marca = "adfadsfsa";
    const detalle = "sindetalle";

    return await Product.create({
        nombre,
        categoria_id: categoria ? categoria.id: null,
        precio,
        moneda_id: moneda ? moneda.id: null,
        marca,
        localidad_id: localidad ? localidad.id: null,
        detalle
    });
};

/**
 * Modifica un producto ya existente.
 * Parámetro id: id a buscar en la base de datos.
 * Parámetro data: JSON con los atributos a crear.
 *
 */
const updateProduct = async (
    id,
    { name = '', price = 0.0, type = ProductType.HOME, discount = 0.0, description = '' } = {}
) => {
    const product = await findById(id);

    if (product != null) {
        return product.update({ name, price, type, discount, description });
    }
    return null;
};

/**
 * Elimina un producto existente.
 * Parámetro id: id a buscar en la base de datos.
 *
 */
const deleteProduct = async (id) => {
    const product = await findById(id);

    if (product != null) {
        return product.destroy();
    }
    return null;

}

const ProductModel = {
    Product: Product,
    getAll: getAllProducts, 
    searchByName: searchProductsByName,
    getMonedas: getMonedas,
    createProduct: createProduct,
    findById: findById,
}

module.exports = ProductModel
