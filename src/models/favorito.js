
const {Sequelize, Model, DataTypes, HasMany} = require('sequelize');

const Bd = require('../db.js');
const Usuario = require('./usuario.js');
const {Product} = require('./product.js');

class Favorito extends Model {}

Favorito.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario_id: {
        field:'usuario_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: Usuario,
        key: 'id',
        },
    },
    producto_id: {
            field:'producto_id',
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
            model: Product,
            key: 'id',
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
},
{sequelize: Bd, modelName: 'Favorito', tableName: 'Favorito'}
);

Favorito.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Favorito.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto'});

const createFavorito = async (userId, productId) => {
    const [favoritoExiste] = await Bd.query(`
        SELECT *
        FROM Favorito 
        WHERE usuario_id = :userId AND producto_id = :productId
    `,
    {
        replacements: { userId: userId, productId: productId }, 
        type: Bd.QueryTypes.SELECT 
    });

    if(Array.isArray(favoritoExiste) && favoritoExiste.length > 0){
        return;
    }

    const favorito = await Bd.query(`
        INSERT INTO Favorito (usuario_id, producto_id) 
        VALUES (:userId, :productId)
    `, 
    { 
        replacements: { userId: userId, productId: productId }, 
        type: Bd.QueryTypes.INSERT 
    });

    return favorito;
};


const getAllFavorites = async (userId) => {
    const results = await Bd.query(`
        SELECT * 
        FROM Favorito
        INNER JOIN Producto ON Favorito.producto_id = Producto.Id
        WHERE Favorito.usuario_id = :userId
    `, 
    { 
        replacements: { userId: userId }, 
        type: Bd.QueryTypes.SELECT 
    });
    
    return results;
};

/*
const deleteFavorito = async (userId, productId) => {
    const favorito = await Bd.query(`
        DELETE FROM Favorito
        WHERE usuario_id = :userId AND producto_id = :productId
    `,
    {
        replacements: { userId: userId, productId: productId},
        type: Bd.QueryTypes.DELETE
    });
    return favorito;
}*/

const FavoritoModel = {
    Favorito: Favorito,
    createFavorito: createFavorito,
    getAllFavorites: getAllFavorites,
    //deleteFavorito: deleteFavorito
}

module.exports = FavoritoModel;
