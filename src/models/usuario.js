
const {Sequelize, Model, DataTypes} = require('sequelize');
const Bd = require('../db.js');
const Municipio = require('./municipio.js'); // Importa el modelo de Localidad
const bycrypt = require('bcrypt-nodejs');

class Usuario extends Model {}

Usuario.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pass: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    municipio_id: {
            field:'municipio_id',
            type: DataTypes.BIGINT,
            references: {
            model: Municipio,
            key: 'id',
        },
    },
},
{sequelize: Bd, modelName: 'Usuario', tableName: 'Usuario'}
);

Usuario.belongsTo(Municipio.Municipio, { foreignKey: 'municipio_id', as: 'municipio' });

Usuario.prototype.encryptPass = (password) =>{
  return bycrypt.hashSync(password,bycrypt.genSaltSync(12));
}

Usuario.prototype.comparePass = function (passwordHash){
    return  bycrypt.compareSync(passwordHash,this.pass)
   // return  bycrypt.compareSync(passwordHash,'$2a$12$Nt2fnIoRRjeNYdl5hBFJ1.0kXzUS5yWoO6DIXdYg9UUXQrVEWxJTi')
}

module.exports = Usuario
