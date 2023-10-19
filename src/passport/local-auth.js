const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/usuario');
const Municipio = require('../models/municipio');
const dd = require("dump-die");

passport.serializeUser((user,done) => {
    done(null,user.id);
})
passport.deserializeUser(async (id,done) => {
    const user = await Usuario.findByPk(id)
    done(null,user.id);
})

passport.use('local-signup', new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,
},async (req,email,password,done) =>{
    const user = await Usuario.findOne({
        where: { email: email },
    });
    if (user){
        return done(null,false,req.flash('signupMessage','El mail ya fue usado'))
    }else{
        const newUser = new Usuario();
        newUser.email = email;
        newUser.pass = newUser.encryptPass(password);
        // Otros datos
        newUser.nombre= req.body['nombre'];
        newUser.apellido= req.body['apellido'];
        newUser.documento= req.body['documento'];
        // const municipio = await Municipio.Municipio.findByPk(parseInt(req.body['municipio_id']));
        newUser.municipio_id= parseInt(req.body['municipio_id']);
        await newUser.save();
        done(null,newUser);
    }


}));

passport.use('local-signin', new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true,
},async (req,email, password,done)=>{

 const usuario = await Usuario.findOne({
    where: { email: email },
 });

 if (!usuario){
     return done(null,false, req.flash('signinMessage','Usuario no encontrado'));
 }
 if (!usuario.comparePass(password)){
     return done(null,false,req.flash('signinMessage','Contraseña incorrecta'));
 }
 return done(null,usuario);
}))
