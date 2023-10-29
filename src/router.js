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
const  Interaccion = require('./models/interaccion.js')
const Alquiler = require('./models/alquiler');
const PaymentController = require('./controllers/paymentsController.js');
const PaymentService = require('./services/paymentsService.js');
const PaymentInstance = new PaymentController(new PaymentService());

const router = express.Router();



router.get('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const usuario_id = req.user;
    const categorias = await ProductModel.getCategorias();
    const { rows, count } = await ProductModel.getAll(pageSize, skip,category, usuario_id);
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

router.get('/chat/:productId',estaAutenticado,async(req,res) => {
    const productId = req.params.productId;
    res.render('_chatProducto.html',{
        product_id:productId
    });
});

router.post('/chat/:productId',estaAutenticado, async (req, res) => {
    const userId = req.user;
    const productId= req.params.productId
    const idOwnerProduct= await ProductModel.getOwner(productId);

    const product = await ProductModel.findById(productId);
    await createNotificacion(product, req.user, 'chat');
    
    console.log('Valor de userId:', userId);
    console.log('Valor de productId:', productId);
    console.log('Valor del id del dueño del producto:', idOwnerProduct);

    // Verificar si ya existe un chat entre los mismos usuarios y con el mismo producto
    const existingChat = await Interaccion.findExistingChat(userId, idOwnerProduct, productId)
    
    if (existingChat) {
        const chatId = existingChat.id;
        console.log('Chat existente - ID del chat:', chatId);
        res.render('_chatProducto.html', { emisor: userId, chatId });
    }else {
        console.log('Chat nuevo - Creando un chat');
        // Crear un chat nuevo porque no existe uno existente
        const newChat = await Interaccion.createInteraccion(userId, idOwnerProduct, productId);
        const chatId = newChat.id;
        console.log('Nuevo chat - ID del chat:', chatId);
        res.render('_chatProducto.html', { emisor: userId, chatId });
    }
});

// Agrega esta ruta para obtener mensajes anteriores
router.get('/messages/:interaccionId', async (req, res) => {
    const interaccionId = req.params.interaccionId;
    console.log('Endpoint get/messages/:interaccionId con un valor de:', interaccionId);
    const messages = await Mensaje.getMessagesByIDChat(interaccionId)
    res.json(messages);
});

router.post('/enviarMensaje/:chatId', estaAutenticado, async (req, res) => {
    const userId = req.user;
    const chatId = req.params.chatId
    const texto = req.body.texto;
    console.log('Valores antes de crear el mensaje:');
    console.log('Valor del userId antes de crear el mensaje:', userId);
    console.log('Valor del chatId antes de crear el mensaje::', chatId);
    console.log('Valor del texto antes de crear el mensaje::', req.body.texto);
        // Aquí, puedes crear un un uevo mensaje en la base de datos
        const newMessage = await Mensaje.createMessage(chatId,userId,texto)
        console.log('valor de chatId post crear el mensaje y persistirlo:', chatId);
        console.log('texto del newMessage :', newMessage.texto);
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
        const interaccion = await PaymentInstance.getPaymentLink(req, res, product);
        //Cambio y guardo el estado del producto
        product.estado = 'A';
        await product.save();
    } catch (error) {
        console.log(error);
    }
});

/*router.get('/webhook', async (req, res) => {
    console.log('webhook');
    res.redirect(`/`);
})
*/


router.post('/favorito/:productId', async (req, res) =>{
    //agregar el id del producto a la lista de favortios del usuario
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido agregar a favoritos el producto" });
    } 
});



router.post('/favorito/:productId', async (req, res) =>{
    //agregar el id del producto a la lista de favortios del usuario
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido agregar a favoritos el producto" });
    } 
});


module.exports = router;
