
const {Sequelize, Model, DataTypes} = require('sequelize');

const Bd = require('../db.js');
const Usuario = require('./usuario.js'); // Importa el modelo de Usuario
const sequelize = require('../db.js');
const Product = require('./product.js');

class Notificacion extends Model {}

Notificacion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    texto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
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
{sequelize: Bd, modelName: 'Notificacion', tableName: 'Notificacion'}
);

const createNotificacionChat = async(product, userId) => {
    const userReceptor = product.usuario_id;
    const user = await Usuario.findByPk(userId);
    const texto = `${user.nombre} ${user.apellido} esta interesad@ en tu ${product.nombre}`;
    const notificacion = await Notificacion.create({
        texto:texto,
        estado:'N',
        usuario_id:userReceptor
    });
    await notificacion.save();
};

const getNotifications = async(userId) => {
    return await Notificacion.findAll({
        where: { usuario_id: userId },
        attributes: ['id', 'texto', 'estado']
    });
};

const marcarComoLeido = async(notificationId) => {
    const notification = await Notificacion.findByPk(notificationId);
    if(notification) {
        notification.estado = 'L';
        await notification.save();
    } 
}

module.exports = {
    Notificacion: Notificacion,
    createNotificacionChat:createNotificacionChat,
    getNotifications:getNotifications,
    marcarComoLeido: marcarComoLeido
}


