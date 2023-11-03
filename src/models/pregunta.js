const {Sequelize,Model, DataTypes} = require('sequelize');
const db = require('../db.js');
const Usuario = require("./usuario");
const {Product} = require("./product");

/**
 * Modelo de pregunta
 */
class Pregunta extends Model {}

Pregunta.init({
        // Atributos
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        texto: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        respuesta: {
            type: Sequelize.STRING,
            allowNull: true,
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
        },
    },
    {sequelize: db, modelName: 'Pregunta',timestamps:false}
);

Pregunta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Pregunta.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });


const listQuest = async (producto)=>{
    return Pregunta.findAll({
            where: {
                producto_id: producto
            }
        }
    )

}

const makeQuest = async (texto, usuario, producto) => {
    if (usuario === producto.usuario_id){
        throw new Error("No puedes autopreguntarte");
    }

    const pregunta = await Pregunta.create({
        usuario_id:usuario,
        texto:texto,
        producto_id:producto,
    });
    await pregunta.save();
    return pregunta;
}




module.exports = {Pregunta,makeQuest,listQuest};
