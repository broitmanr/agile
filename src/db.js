const path = require('path');
const Sequelize = require('sequelize');
const env = require('./utils/env.js');
const pc = require('picocolors');
const cloudinary = require('cloudinary').v2;

const cloudName = env.cloudName;
const apiKey = env.apiKey;
const apiSecret = env.apiSecret;

cloudinary.config({ 
  cloud_name: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret
});

const inTest = env.test;
const base = env.base;
const userbd = env.userbd;
const contrabd = env.contrabd;

const sequelize = new Sequelize(base, userbd, contrabd, {
    host: 'servidoragiles.database.windows.net',
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
})

  sequelize
    .authenticate()
    .then(() => {
      console.info(pc.green('conectado al servidor'))
    })
    .catch((error) => {
      console.error(pc.red('error al conectarse a la base: '), error)
    })


//   db.User = require('./user')(sequelize)

  module.exports = sequelize;
  module.exports.cloudinary = cloudinary;
