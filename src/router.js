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
const {createNotificacion,getNotifications,marcarComoLeido} = require('./models/notificacion');
const {createAlquiler} = require('./models/alquiler');
const { estaAutenticado } = require('./models/product.js');
const  Mensaje = require('./models/mensaje.js')
const  Interaccion  =require('./models/interaccion.js')
const  FavoritoModel  = require('./models/favorito.js')
const Alquiler = require('./models/alquiler');
const PaymentController = require('./controllers/paymentsController.js');
const PaymentService = require('./services/paymentsService.js');
const alquiler = require('./models/alquiler');
const { data } = require('jquery');
const PaymentInstance = new PaymentController(new PaymentService());

const router = express.Router();



router.get('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const usuario_id = req.user;
    const categorias = await ProductModel.getCategorias();
    let { rows, count } = await ProductModel.getAll(pageSize, skip,category, usuario_id);

    if(rows.length % 3 != 0){
        rows = rows.slice(0, -(rows.length % 3));
    }
    
    res.render('home.html', {
        products: rows,
        categories: categorias,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
        estaAutenticado: req.isAuthenticated(),
    });
});

router.post('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.body.category || undefined;
    const skip = pageSize * (currentPage - 1);
    const usuario_id = req.user;
    const categorias = await ProductModel.getCategorias();
    let { rows, count } = await ProductModel.getAll(pageSize, skip,category, usuario_id);

    if(rows.length % 3 != 0){
        rows = rows.slice(0, -(rows.length % 3));
    }

    let selectedCategories = req.body.category || '';
    
    res.render('home.html', {
        products: rows,
        categories: categorias,
        selectedCategories: selectedCategories,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
        estaAutenticado: req.isAuthenticated(),
    });
});

router.get('/notificaciones', async function(req, res){
    const usuario_id = req.user;
    const notifications = req.isAuthenticated() ? await getNotifications(usuario_id) : null;
    res.json(notifications);
})

router.post('/notificaciones/:id', async function(req, res){
    const notificationId = req.params.id;
    await marcarComoLeido(notificationId);
    res.json({ success: true });
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
    const productData = req.body;
    console.log(productId)
    const product = await ProductModel.findById(productId);
    const locador = product.usuario_id;
    const locatario = req.user;
    const interaccion = await Interaccion.findByUsersProduct(locador, locatario, productId);
    await Alquiler.createAlquiler(interaccion.id);
    await createNotificacion(product, locatario, 'alquiler');
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

//Para mostrar los productos favoritos
router.get('/my_favs', estaAutenticado, async (req, res) => {
    
    try{
        const userId = req.user;
        const products = await FavoritoModel.getAllFavorites(userId);
        res.render('_my_favs.html', { products: products });
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "¡Error! No se han encontrado los productos favoritos del usuario"});
    }
});

//Para marcar los productos favoritos
router.post('/my_favs/:productId', estaAutenticado, async (req, res) => {
    try{
        const userId = req.user;
        const productId = +req.params.productId;
        await FavoritoModel.createFavorito(userId, productId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "¡Error! No se logró marcar el producto como favorito"});
    }
});

router.delete('/my_favs/delete/:productId', estaAutenticado, async (req, res) =>{
    try{
        const userId = req.user;
        const productId = +req.params.productId;
        console.log(productId);
        await FavoritoModel.deleteFavorito(userId, productId);
        res.json({ success: true });
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido eliminar el favorito" });
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

router.delete('/product/delete/:id', async (req, res) =>{
    try{
        const productID = +req.params.id;
        const result = await ProductModel.deleteProduct(productID);
        console.info({message: "¡Eliminado! Se elimino con exito el producto ",result});
        res.json({ success: true });
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
        ultimoMensaje
    });
    }
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
    await createNotificacion(product, req.user, 'chat');
    const chatList = await Interaccion.getChatsByUserID(userId)
    const chatsWithLastMessages = [];
    for (const chat of chatList) {
        const ultimoMensaje = await Mensaje.getLastMessageByIdChat(chat.id)
        chat.dataValues.ultimoMensaje = ultimoMensaje;
        const fechaUltimoMensaje = chat.dataValues.ultimoMensaje
        ? new Date(chat.dataValues.ultimoMensaje.fecha)
        : null;
        const fechaFormateada = formatFechaUltimoMensaje(fechaUltimoMensaje);
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

//Metodos de pago

/**
 * Pasos para iniciar el pago
 * 
 * 1- En la consola instalar todas las dependencias del package con la instruccion
 *  opcion01:  npm i 
 *  opcion02:  nom install 
 * 
 * 2- En la carpeta general del proyecto fuera de cualquier carpeta agregar un archivo llamado .env
 *  En dicho archivo escribir 
 *      ACCESS_TOKEN=APP_USR-4624116435845049-102711-63a84c8704c091863384d686ec5248ff-1526605858
 * 
 * Es el token para conectar con api de pruebas
 */

/**
 * 
 * Link: 
 * -Para el vendedor https://www.mercadopago.com.ar/home (hay que iniciar sesion con el email y el password) En este home se ven los pagos
 * 
 * -Para el comprador https://www.mercadopago.com.ar/developers/ (hay que iniciar sesion para pagar)
 * Datos de prueba:
 * 
 * Usuario de prueba 01	VENDEDOR

{"id":1526605858,"email":"test_user_785561243@testuser.com","nickname":"TESTUSER785561243","site_status":"active","password":"LzORaFgxhj"}
----------------------------------------------------------------------
Api prueba de rentar para generar el access_token

nombre
	Api-Prueba-Rentar
	APP_USR-4624116435845049-102711-63a84c8704c091863384d686ec5248ff-1526605858
	TEST-4624116435845049-102711-83d2f62fcbe8178a4d8daf8acff3bb91-1526605858
--------------------------------------------------------------------------------
Usuario de prueba 02	COMPRADOR

{"id":1525097059,"email":"test_user_1685160373@testuser.com","nickname":"TESTUSER1685160373","site_status":"active","password":"C4R6YLrFI1"}

 */

router.post('/payment/:productId', estaAutenticado, async (req, res, next) => {
    //Datos del producto
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    try {
        await PaymentInstance.getPaymentLink(req, res, product);
    } catch (error) {
        console.log(error);
    }
});

/**
 * Ruta que se usa para que MP responda por success y redireccione a la pagina _product_details_success.html
 */
router.get('/details_success/:productId', estaAutenticado, async (req, res) => {
    const productId = req.params.productId;
    const producto = await ProductModel.findById(productId);
    const locatario = await ProductModel.getOwner(productId);
    const locador = req.user;
    const interaccion = await Interaccion.findByUsersProduct(locador,locatario,productId);
    try {
        const alquiler = await Alquiler.createAlquiler(interaccion.id);
        res.render('_product_details_success.html', {product: producto, alquiler: alquiler});
    } catch (error) {
        console.error(error);
    }
});

/**
 * Ruta que se usa para que MP responda por pending y redireccione a la pagina _product_details_pending.html
 */
router.get('/details_pending/:productId', estaAutenticado, async (req, res) => {
    const productId = req.params.productId;
    const producto = await ProductModel.findById(productId);
    res.render('_product_details_pending.html', {product: producto});
});

/**
 * Ruta que se usa para que MP responda por failure y redireccione a la pagina _product_details_failure.html
 */
router.get('/details_failure/:productId', estaAutenticado, async (req, res) => {
    const productId = req.params.productId;
    const producto = await ProductModel.findById(productId);
    res.render('_product_details_failure.html', {product: producto});
});

router.post('/estado_alquilar/:productId', estaAutenticado, async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await ProductModel.findById(productId);
        const locatario = await ProductModel.getOwner(productId);
        const locador = req.user;
        const interaccion = await Interaccion.findByUsersProduct(locador,locatario,productId);
        product.estado = 'A';
        await product.save();
        const alquiler = await Alquiler.createAlquiler(interaccion.id);
        res.json({
            'alquiler':alquiler.id,
            'producto':productId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "¡Error! No se logró cambiar a estado alquilado"});
    }
});

/**
 * llamado de success
 */

router.get('/_product_details_alquilado/:alquilerId', estaAutenticado, async (req, res) => {
    const alquilerID= req.params.alquilerId;
    const alquiler = await Alquiler.buscarAlquiler(alquilerID);
    const interaccion=alquiler.interaccion_id
    const product_id= await Interaccion.findProductId(interaccion)
    console.log(product_id)
    const product = await ProductModel.findById(product_id);
    res.render('_product_details.html', {product: product, alquiler: alquiler});
});

/**
 * parametros de id producto y alquiler
 */
router.post('/_product_details_EAlquilado/:alquilerId', estaAutenticado, async (req, res) => {
    const alquilerID= req.params.alquilerId;
    const alquiler = await Alquiler.buscarAlquiler(alquilerID);
    await Alquiler.cambioEstado(alquilerID,'A');
    res.json({ success: true });
});

/**
 * parametros de id producto y alquiler

router.get('/_product_details_EDevolver/:alquilerId', estaAutenticado, async (req, res) => {
    const interaccionId = req.params.alquilerId.interaccion_id;
    const alquilerId= req.params.alquilerId;
    const productId= interaccionId.product_id;
    const product = await ProductModel.findById(productId);
    var alquiler = await Alquiler.buscarAlquiler(alquilerId);
    await Alquiler.cambioEstado(alquilerId,'F');
    res.render('_product_details_alquilado.html', {product: product, alquiler: alquiler});
});
*/
/**
 * parametros de id producto y alquiler
 */
router.get('/_product_details_EFinalizado/:alquilerId', estaAutenticado, async (req, res) => {
    const interaccionId = req.params.alquilerId.interaccion_id;
    const alquilerId= req.params.alquilerId;
    const productId= interaccionId.product_id;
    const product = await ProductModel.findById(productId);
    var alquiler = await Alquiler.buscarAlquiler(alquilerId);
    await Alquiler.cambioEstado(alquilerId,'PR');
    res.render('_product_details_alquilado.html', {product: product, alquiler: alquiler});
});


/*router.get('/webhook', async (req, res) => {
    console.log('webhook');
    res.redirect(`/`);
})
*/

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

  router.get('/null/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    product.estado = null;
    await product.save();
    res.redirect(`/`);
})

module.exports = router;
