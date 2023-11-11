const {Sequelize, Model, DataTypes} = require('sequelize');

const Bd = require('../db.js');
const sequelize = require('../db.js');
const Interaccion = require('./interaccion.js');
const Usuario = require("./usuario");
const {Product} = require("./product");

class Alquiler extends Model {}

Alquiler.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    interaccion_id: {
        field:'interaccion_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Interaccion.Interaccion,
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
    },
    calificacion:{
        type:DataTypes.FLOAT,
        allowNull:true
    }
},
{sequelize: Bd, modelName: 'Alquiler', tableName: 'Alquiler'}
);


Alquiler.belongsTo(Interaccion.Interaccion, { foreignKey: 'interaccion_id', as: 'interaccion' });
const createAlquiler = async(interaccion_id) => {
    const alquiler = await Alquiler.create({
        estado:'PR',
        interaccion_id
    });
    await alquiler.save();
    return alquiler
};

const cambioEstado = async(alquilerId, estado) => {
    const alquiler = await Alquiler.findByPk(alquilerId);
    if(alquiler) {
        //El estado puede tomar PR=por retirar, A=alquilando, PD=por devolver y F=finalizado
        alquiler.estado = estado;
        await alquiler.save();
    }
}

const buscarAlquiler = async(alquilerId) => {
    const alquiler = await Alquiler.findOne({
        where: { id: alquilerId }
    });
    if (alquiler ){
        return alquiler
    } else {
        return null;
    }
}
module.exports = {
    Alquiler: Alquiler,
    createAlquiler:createAlquiler,
    cambioEstado:cambioEstado,
    buscarAlquiler:buscarAlquiler
}
