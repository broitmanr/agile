const { CartModel, ProductModel } = require('./models/index.js');
const express = require('express');
const productType = require('./models/productType.js');
const dd = require('dump-die');
const path = require('path');
const { error } = require('console');
const Categoria = require("./models/categoria");
const Municipio = require("./models/municipio");
const passport = require('passport');
const { upload } = require('./models/product.js');
const {createNotificacionChat,getNotifications,marcarComoLeido} = require('./models/notificacion');
const {createAlquiler} = require('./models/alquiler');
const { estaAutenticado } = require('./models/product.js');
const  Mensaje = require('./models/mensaje.js')
const  Interaccion  =require('./models/interaccion.js')
const Alquiler = require('./models/alquiler');

const router = express.Router();



router.get('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const usuario_id = req.user;
    const categorias = await ProductModel.getCategorias();
    const { rows, count } = await ProductModel.getAll(pageSize, skip,category, usuario_id);
    const notifications = req.isAuthenticated() ? await getNotifications(usuario_id) : null;
    const notificationId = req.query.notificationId;
    if(notificationId){
        await marcarComoLeido(notificationId);
    }
    res.render('home.html', {
        products: rows,
        categories: categorias,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
        estaAutenticado: req.isAuthenticated(),
        notifications
    });
});

router.get('/formulario',estaAutenticado,async(req,res) => {
    try{
        const monedas = await ProductModel.getMonedas();
        const localidades = await ProductModel.getLocalidades();
        const categorias = await ProductModel.getCategorias();
        res.render('formulario.html', { monedas, localidades, categorias });
    }catch(error){
        console.error(error);
    }
});

router.post('/formulario',estaAutenticado, upload.single('urlImagen'), async (req, res) => {
    const userId = req.user;
    const productData = req.body;

    productData.urlImagen= req.file ? req.file.path : '';
    try{
        const newProduct = await ProductModel.createProduct(productData, userId);
        const productID = newProduct.id;
        res.redirect(`/product/details/${productID}`);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido crear el producto" });
    }
});

router.get('/alquilar/:productId',estaAutenticado,async(req,res) => {
    const productId = req.params.productId;

    res.render('alquilar.html',{
        product_id:productId
    });
});


router.post('/alquilar/:productId',estaAutenticado, async (req, res) => {
    const productId = req.params.productId;
    console.log(productId)
    const product = await ProductModel.findById(productId);
    const locador = product.usuario_id;
    const locatario = req.user;
    const interaccion = await Interaccion.findByUsersProduct(locador, locatario, productId);
    await Alquiler.createAlquiler(interaccion.id);
    product.estado = 'A';
    await product.save();
    res.redirect(`/`);
});

router.get('/my_products', estaAutenticado, async (req, res) => {
    const userId = req.user;

    try{
        const products = await ProductModel.getProductsByUser(userId);
        res.render('_my_products.html', { products });
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "¡Error! No se han encontrado los productos del usuario"});
    }
});

router.get('/product/details/:id', async function (req, res) {
    const productId = +req.params.id; // Obtenemos el ID del producto desde la URL
    const productDetails = await ProductModel.findById(productId);
    if (productDetails != null) {
    }
     // Renderiza la vista de detalles del producto y pasa los datos del producto
    res.render('_product_details.html', { product: productDetails });

});

router.get('/product/delete/:id', async (req, res) =>{
    try{
        const productID = +req.params.id;
        const result = await ProductModel.deleteProduct(productID);
        console.info({message: "¡Eliminado! Se elimino con exito el producto ",result});
        res.redirect('/my_products');
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido eliminar el producto" });
    }
});

router.get('/_header', async (req, res) => {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const productName = req.query.product_name
    const usuario_id = req.user;
    const categorias = await ProductModel.getCategorias();
    const {rows,count} = await ProductModel.searchByName(productName, usuario_id,category);
    res.render('home.html', {
        products: rows,
        categories: categorias,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
    })
})

router.get('/continuarChat/:chatId', estaAutenticado,async(req,res)=>{
    const userId = req.user;
    const chatId= req.params.chatId
    console.log('Valor de userId en el endpoint /continuarChat/:chatId:', userId);
    console.log('Valor de chatId en el endpoint /continuarChat/:chatId:', chatId);
    const chatList = await Interaccion.getChatsByUserID(userId)
    const chatsWithLastMessages = [];
    for (const chat of chatList) {
        const ultimoMensaje = await Mensaje.getLastMessageByIdChat(chat.id)
        chat.dataValues.ultimoMensaje = ultimoMensaje;
    
        console.log('Valor del endPoint /mis-chats de chatList:');
        console.log('Interacción ID:', chat.dataValues.id);
        console.log('Locatario ID:', chat.dataValues.locatario_id);
        console.log('Locador ID:', chat.dataValues.locador_id);
        console.log('Producto ID:', chat.dataValues.producto_id);

        const locatario = chat.dataValues.locatario ? chat.dataValues.locatario.nombre : 'No definido';
        const locador = chat.dataValues.locador ? chat.dataValues.locador.nombre : 'No definido';
        console.log('Nombre del Locatario:', locatario);
        console.log('Nombre del Locador:', locador);

        const ultimoMensajeTexto = chat.dataValues.ultimoMensaje
            ? chat.dataValues.ultimoMensaje.texto
            : 'No hay mensajes';
        console.log('Último Mensaje:', ultimoMensajeTexto);
        console.log('-----------------------------------');
    // Agrega la fecha del último mensaje (supongamos que la fecha está en una propiedad llamada "fecha")
        const fechaUltimoMensaje = chat.dataValues.ultimoMensaje ? new Date(chat.dataValues.ultimoMensaje.fecha) : null;
        const fechaFormateada = formatFechaUltimoMensaje(fechaUltimoMensaje);
        chat.dataValues.fecha= fechaFormateada
    chatsWithLastMessages.push({
        ...chat,
        ultimoMensaje: ultimoMensajeTexto,
    });
    }
    console.log('Chats con últimos mensajes:', chatsWithLastMessages);
    res.render('_chatProducto.html', { emisor: userId, chatId, chats: chatsWithLastMessages});
});

router.get('/mis-chats',estaAutenticado, async (req, res) => {
    const userId = req.user;
    console.log('Valor de userId:', userId);
    const chatList = await Interaccion.getChatsByUserID(userId)
    const chatsWithLastMessages = [];
    for (const chat of chatList) {
        const ultimoMensaje = await Mensaje.getLastMessageByIdChat(chat.id)
        chat.dataValues.ultimoMensaje = ultimoMensaje;
        const fechaUltimoMensaje = chat.dataValues.ultimoMensaje ? new Date(chat.dataValues.ultimoMensaje.fecha) : null;
        const fechaFormateada = formatFechaUltimoMensaje(fechaUltimoMensaje);
        chat.dataValues.fecha= fechaFormateada
    chatsWithLastMessages.push({
        ...chat,
        ultimoMensaje,
    });
    }
    res.render('_chatProducto.html', { emisor: userId, chats: chatsWithLastMessages});
});

router.post('/chat/:productId',estaAutenticado, async (req, res) => {
    const userId = req.user;
    const productId= req.params.productId
    const idOwnerProduct= await ProductModel.getOwner(productId);
    const chatCompleto = await Interaccion.getChat(userId,idOwnerProduct,productId);
    const chatId= chatCompleto.id;
    const product = await ProductModel.findById(productId);

    await createNotificacionChat(product, req.user);

    const chatList = await Interaccion.getChatsByUserID(userId)
    const chatsWithLastMessages = [];
    for (const chat of chatList) {
        const ultimoMensaje = await Mensaje.getLastMessageByIdChat(chat.id)
        chat.dataValues.ultimoMensaje = ultimoMensaje;
        const fechaUltimoMensaje = chat.dataValues.ultimoMensaje
        ? new Date(chat.dataValues.ultimoMensaje.fecha)
        : null;
        const fechaFormateada = formatFechaUltimoMensaje(fechaUltimoMensaje);
        console.log('Fecha del Último Mensaje:', fechaFormateada)
        chat.dataValues.fecha= fechaFormateada
        chatsWithLastMessages.push({
        ...chat,
        ultimoMensaje,
    });
    }
    res.render('_chatProducto.html', { emisor: userId, chatId, chats: chatsWithLastMessages});
});

router.get('/messages/:interaccionId', async (req, res) => {
    const interaccionId = req.params.interaccionId;
    const messages = await Mensaje.getMessagesByIDChat(interaccionId)
    res.json(messages);
});

router.post('/enviarMensaje/:chatId', estaAutenticado, async (req, res) => {
    const userId = req.user;
    const chatId = req.params.chatId
    const texto = req.body.texto;
    const newMessage = await Mensaje.createMessage(chatId,userId,texto)
    res.json(newMessage);
});

router.get('/sign-up',async function (req, res, next){
  const municipios = await Municipio.findAll();
    res.render('registro.html',{municipios: municipios});
});

router.post('/sign-up',passport.authenticate('local-signup',{
    successRedirect: '/',
    failureRedirect: '/sign-up',
    passReqToCallback:true,
}));


router.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) {
            console.log(err);
            return;
        }
        res.redirect('/');
    });
});
router.get('/sign-in',async function (req, res, next){
    res.render('login.html');
});
router.post('/sign-in',passport.authenticate('local-signin',{
    successRedirect: '/',
    failureRedirect:'/sign-in',
    passReqToCallback:true,
}));



router.get('/prueba',isAuth,async function (req, res, next){
    res.render('prueba.html');
});
function isAuth(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');

}
function formatFechaUltimoMensaje(fechaUltimoMensaje) {
    if (!fechaUltimoMensaje) {
      return 'No hay mensajes';
    }
  
    const now = new Date();
    const messageDate = new Date(fechaUltimoMensaje);
  
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  
    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else {
      const day = messageDate.getDate().toString().padStart(2, '0');
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const year = messageDate.getFullYear();
  
      return `${day}/${month}/${year}`;
    }
  }
module.exports = router;
