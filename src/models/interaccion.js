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

Interaccion.belongsTo(Usuario, { foreignKey: 'locatario_id', as: 'usuario1' });
Interaccion.belongsTo(Usuario, { foreignKey: 'locador_id', as: 'usuario2' });
Interaccion.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto'});


const createInteraccion = async (locatario_id, locador_id, producto_id) => {
      const interaccion = await Interaccion.create({
          locatario_id,
          locador_id,
        producto_id,
      });
      return interaccion;
}

const findExistingChat = async (userId, idOwnerProduct, productId) => {
    const existingChat = await Interaccion.findOne({
      where: {
        [Op.or]: [
          { locatario_id: userId, locador_id: idOwnerProduct, producto_id: productId },
          { locatario_id: idOwnerProduct, locador_id: userId, producto_id: productId },
        ],
      },
    });
    return existingChat;
};

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

module.exports = {
    Interaccion: Interaccion,
    createInteraccion: createInteraccion,
    findExistingChat: findExistingChat,
    findByUsersProduct:findByUsersProduct
}
