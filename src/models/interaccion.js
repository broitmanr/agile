const {  Model, DataTypes, Op } = require('sequelize');
const Bd = require('../db.js');
const Usuario = require('./usuario.js');
const {Product} = require('./product.js'); 

class Interaccion extends Model {}

Interaccion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usu1_id: {
        field:'usu1_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: Usuario,
        key: 'id',
        },
    },
    usu2_id: {
        field:'usu2_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: Usuario,
        key: 'id',
        },
    },
    
    producto_id: {
      field: 'producto_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
  },
  { sequelize: Bd, modelName: 'Interaccion', tableName: 'Interaccion' }
);

Interaccion.belongsTo(Usuario, { foreignKey: 'usu1_id', as: 'usuario1' });
Interaccion.belongsTo(Usuario, { foreignKey: 'usu2_id', as: 'usuario2' });
Interaccion.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto'});


const createInteraccion = async (usu1_id, usu2_id, producto_id) => {
      const interaccion = await Interaccion.create({
        usu1_id,
        usu2_id,
        producto_id,
      });
      return interaccion;
} 

const findExistingChat = async (userId, idOwnerProduct, productId) => {
    const existingChat = await Interaccion.findOne({
      where: {
        [Op.or]: [
          { usu1_id: userId, usu2_id: idOwnerProduct, producto_id: productId },
          { usu1_id: idOwnerProduct, usu2_id: userId, producto_id: productId },
        ],
      },
    });
    return existingChat;
  };
  
module.exports = {
    Interaccion: Interaccion,
    createInteraccion: createInteraccion,
    findExistingChat: findExistingChat
}
