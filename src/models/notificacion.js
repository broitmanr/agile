
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
    icono_fa: {
        type: DataTypes.STRING,
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
    tipoNotificacion: {
        type: DataTypes.STRING,
        allowNull: false,
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

function notificacionFormato(tipo, user, product) {
    if(tipo === 'chat') {
        return `${user.nombre} ${user.apellido} ha iniciado una conversación contigo por tu ${product.nombre}`;
    } else if (tipo === 'alquiler'){
        return `${user.nombre} ${user.apellido} ha alquilado tu ${product.nombre}`;
    } else if (tipo === 'pregunta'){
        return `${user.nombre} ${user.apellido} te hizo una pregunta sobre ${product.nombre}`;
    } else {
        throw new Error (`No se reconoce el tipo de notificación ${tipo}`);
    }
}

function getIcono(tipo){
    switch (tipo){
        case 'chat': return 'fa-comment';
        case 'alquiler': return 'fa-shopping-cart';
        case 'pregunta': return'fa-question-circle';
    }
}

const createNotificacion = async(product, userId, tipo) => {

    const userReceptor = product.usuario_id;
    const user = await Usuario.findByPk(userId);
    const texto = notificacionFormato(tipo, user, product);
    const icono = getIcono(tipo);
    const notificacion = await Notificacion.create({
        texto: texto,
        estado:'N',
        icono_fa:icono,
        usuario_id:userReceptor,
        tipoNotificacion: tipo
    });
    await notificacion.save();
};

const getNotifications = async(userId) => {
    return await Notificacion.findAll({
        where: { usuario_id: userId },
        attributes: ['id', 'texto', 'estado', 'createdAt','icono_fa', 'tipoNotificacion']
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
    createNotificacion:createNotificacion,
    getNotifications:getNotifications,
    marcarComoLeido: marcarComoLeido
}


