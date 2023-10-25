const { Sequelize, Model, DataTypes } = require('sequelize');
const Usuario = require('./usuario.js'); // Asegúrate de importar el modelo de Usuario si no lo has hecho
const {Interaccion}=require('./interaccion.js');
const db = require('../db.js');

class Mensaje extends Model {}

Mensaje.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    interaccion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Interaccion,
        key: 'id',
      },
    },
    emisor: {
      field:'emisor',
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
      model: Usuario,
      key: 'id',
      },
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  { sequelize: db, modelName: 'Mensaje', tableName: 'Mensaje' }
);


Mensaje.belongsTo(Usuario, { foreignKey: 'emisor', as: 'usuarioEmisor'});
Mensaje.belongsTo(Interaccion, { foreignKey: 'interaccion_id', as: 'interaccion'});

const createMessage = async (interaccion_id, emisor, texto) => {
  const newMessage = await Mensaje.create({
    interaccion_id,
    emisor,
    texto,
  });
  return newMessage;
};

const getMessagesByIDChat = async (interaccionId) => {
  const messages = await Mensaje.findAll({
    where: { interaccion_id: interaccionId },
    order: [['fecha', 'ASC']],
  });
  return messages;
};
module.exports = {
  Mensaje: Mensaje,
  createMessage: createMessage,
  getMessagesByIDChat: getMessagesByIDChat
}