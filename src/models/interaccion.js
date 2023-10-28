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
    locatario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: Usuario,
        key: 'id',
        },
    },
    locador_id: {
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

Interaccion.belongsTo(Usuario, { foreignKey: 'locatario_id', as: 'locatario' });
Interaccion.belongsTo(Usuario, { foreignKey: 'locador_id', as: 'locador' });
Interaccion.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto'});


const createInteraccion = async (locatario_id, locador_id, producto_id) => {
      const interaccion = await Interaccion.create({
          locatario_id,
          locador_id,
        producto_id,
      });
      return interaccion;
}

/*const chatCreados = await Interaccion.findAll({
  where: {
    locatario_id: userId,
  }
});
return chatCreados
*/
const getChat= async (userId, idOwnerProduct, productId) => {
  let locatarioId, locadorId;
  if (userId != idOwnerProduct) {
    locatarioId = userId;
    locadorId = idOwnerProduct;
  const existingChat = await Interaccion.findOne({
    where: {
      [Op.or]: [
        { locatario_id: locatarioId, locador_id: locadorId, producto_id: productId },
        { locatario_id: locadorId, locador_id: locatarioId, producto_id: productId },
        ],
      },
      });
    if (existingChat) {
      return existingChat;
    } else {
      return createInteraccion(locatarioId, locadorId, productId);
    }
  }
} 
const findByUsersProduct = async (locador_id,locatario_id,producto_id)=>{
    const interaccion = await Interaccion.findOne(
        {
        where: {
            locatario_id: locatario_id,
            locador_id: locador_id,
            producto_id: producto_id
        }
    });
    if (interaccion){
        return interaccion;
    }else{
        return createInteraccion(locatario_id,locador_id,producto_id);
    }

}

const getChatsByUserID = async (userId) => {
  return await Interaccion.findAll({
    where: {
      [Op.or]: [
        { locatario_id: userId },
        { locador_id: userId },
      ],
    },
    include: [
      {
        model: Usuario,
        as: 'locatario',
        attributes: ['id', 'nombre'],
      },
      {
        model: Usuario,
        as: 'locador',
        attributes: ['id', 'nombre'],
      },
      {
        model: Product,
        as: 'producto',
        attributes: ['id', 'nombre'],
      },
    ],
  });
};


module.exports = {
    Interaccion: Interaccion,
    createInteraccion: createInteraccion,
    getChat:getChat,
    findByUsersProduct:findByUsersProduct,
    getChatsByUserID: getChatsByUserID,
}
