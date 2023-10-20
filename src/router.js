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
const { estaAutenticado } = require('./models/product.js');
const  Mensaje = require('./models/mensaje.js')
const  Interaccion  =require('./models/interaccion.js')
const router = express.Router();



router.get('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const usuario_id = req.user;
    const { rows, count } = await ProductModel.getAll(pageSize, skip, usuario_id);
    res.render('home.html', {
        products: rows,
        categories: productType.types,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
        estaAutenticado: req.isAuthenticated(),
    });
});

router.get('/formulario', estaAutenticado, async(req,res) => {
    try{
        const monedas = await ProductModel.getMonedas();
        const localidades = await ProductModel.getLocalidades();
        const categorias = await ProductModel.getCategorias();
        res.render('formulario.html', { monedas, localidades, categorias });
    }catch(error){
        console.error(error);
    }
});

router.post('/formulario', upload.single('urlImagen'), async (req, res) => {
    const userId = req.user;
    const productData = req.body;
    productData.urlImagen= req.file.path;
    try{
        const newProduct = await ProductModel.createProduct(productData, userId);
        const productID = newProduct.id;
        res.redirect(`/product/details/${productID}`);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido crear el producto" });
    }
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
    console.log("Entro al metodo");
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
    const {rows,count} = await ProductModel.searchByName(productName, usuario_id);
    res.render('home.html', {
        products: rows,
        categories: productType.types,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
    })
})

router.post('/chat/:productId',estaAutenticado, async (req, res) => {
    const userId = req.user;
    const productId= req.params.productId
    const idOwnerProduct= await ProductModel.getOwner(productId);
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
    console.log('interaccionId:', interaccionId);
    const messages = await Mensaje.getMessagesByIDChat(interaccionId)
    res.json(messages);
});

router.post('/enviarMensaje/:chatId', estaAutenticado, async (req, res) => {
    const userId = req.body.emisor;
    const chatId = req.params.chatId
    const texto = req.body.texto;
    console.log('Valores antes de crear el mensaje:');
    console.log('userId:', userId);
    console.log('chatId:', chatId);
    console.log('texto:', req.body.texto);
        // Aquí, puedes crear un un uevo mensaje en la base de datos
        const newMessage = await Mensaje.createMessage(chatId,userId,texto);
        const io = req.app.get('socketio');
        console.log('valor de io:', io);
        io.to(`chat-${chatId}`).emit('chat message', {
            texto: newMessage.texto,
            emisor: newMessage.emisor,
        });
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
module.exports = router;
