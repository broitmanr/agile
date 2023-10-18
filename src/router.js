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

const router = express.Router();



router.get('/', async function (req, res) {
    const pageSize = 10;
    const currentPage = +req.query.page || 1;
    const category = req.query.type || undefined;
    const skip = pageSize * (currentPage - 1);
    const { rows, count } = await ProductModel.getAll(pageSize, skip);
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
    const productData = req.body;
    productData.urlImagen= req.file.path;
    try{
        const newProduct = await ProductModel.createProduct(productData);
        const productID = newProduct.id;
        res.redirect(`/product/details/${productID}`);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "¡Error! No se ha podido crear el producto" });
    }
});
/*
router.get('/my_products/:userId', estaAutenticado, async (req, res) => {
    const userId = req.params.userId;

    try{
        const products = await ProductModel.getProductsByUser(userId);
        res.render('_my_products.html', { products });
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "¡Error! No se han encontrado los productos del usuario"});
    }
});*/

router.get('/my_products', async function(req, res) {
    res.sendFile(path.join(__dirname, '/views/_my_products.html'));
})

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
        res.redirect('/');
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
    const {rows,count} = await ProductModel.searchByName(productName);
    res.render('home.html', {
        products: rows,
        categories: productType.types,
        pagination: {
            totalPages: Math.ceil(count / pageSize),
            currentPage: currentPage,
        },
    })
})

router.get('/chat/:productId', async (req, res) => {
    // Obtén el ID del producto desde la URL
    const productId = req.params.productId;

    // Renderiza la vista del chat y pasa el ID del producto
    res.render('_chatProducto.html', { productId });
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
