const path = require('path');


const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const nunjucks = require('./utils/nunjucks.js');
const env = require('./utils/env.js');
const flash = require('connect-flash');

//Color de consola
const pc = require('picocolors');

// Modelos
const models = require('./models/index.js');

const detectPort = require('detect-port');

// Rutas
const router = require('./router.js');
const lhroute = require('./.lhroute.js');
const compression = require('compression');
const dd = require("dump-die");
const session = require("express-session");
const passport = require("passport");
const net = require("net");

const inTest = env.test;
const viewsPath = path.resolve(__dirname, '.', 'views');
const publicPath = path.resolve(__dirname, '.', 'static');

async function startServer(port = process.env.PORT) {
    port = port || (await detectPort(3000));
    // await models.createTables();

    const app = express();

    // Cosas de usuario y sesion
    require('./passport/local-auth');
    const session = require('express-session');
    app.use(session({
        secret: '$ave4RgenTina',
        resave:false,
        saveUninitialized:false,
    }))

    const passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.use((req,res,next)=>{
        app.locals.signupMessage = req.flash('signupMessage');
        app.locals.signinMessage = req.flash('signinMessage');
        console.log(app.locals.signinMessage);
        next();
    })
    if (!inTest) {
        app.use(morgan('dev'));
    }


    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(compression());
    app.use(express.urlencoded({ extended: false }));

    app.use('/static', express.static(publicPath));
    app.use(express.static(path.join(__dirname, 'images')));


    const jqueryPath = require.resolve('jquery');
    app.use('/jquery', express.static(path.dirname(jqueryPath)));

    const select2Path = require.resolve('select2');
    app.use('/select2', express.static(path.dirname(select2Path)));






    nunjucks.init({
        express: app,
        viewsPath,
    });

    // rutas de la vista
    app.use('/', router);


    if (process.env.NODE_ENV !== 'production') {
        app.use('/lh', lhroute);
    }

    return new Promise(function (resolve) {
        const server = app.listen(port, function () {
            if (!inTest) {
                console.log(pc.blue(`Server listen on`),pc.bold(`http://localhost:${port}`));
            }

            const originalClose = server.close.bind(server);
            server.close = async () => {
                return new Promise((resolveClose) => {
                    originalClose(resolveClose);
                });
            };

            resolve(server);
        });
    });
}


if (require.main === module) {
    startServer();
}

module.exports = {
    start: startServer,
};

