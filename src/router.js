const { CartModel, ProductModel } = require('./models/index.js');
const express = require('express');
const productType = require('./models/productType.js');
const dd = require('dump-die');
const path = require('path');
const { error } = require('console');
//const Categoria=require('./categoria');

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
    });
});

router.get('/formulario', async(req,res) => {
    try{
        const monedas = await ProductModel.getMonedas();
        res.render('formulario.html', { monedas });
    }catch(error){
        console.error(error);
    }
});

router.post('/formulario', async (req, res) => {
    const productData = req.body;
    try{
        const newProduct = await ProductModel.createProduct(productData);
        res.status(201).json(newProduct);
    } catch (error){
        console.error(error);
        res.status(500).json({message: "¡Error! No se ha podido crear el producto"});
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

router.post('/cart', async function (req, res) {
    const productID = +req.body.productid;
    const product = await ProductModel.findById(productID);

    if (product != null) {
        await CartModel.addProductToCart(1, product);
    }

    res.redirect('/cart');
});

router.post('/discard', async function (req, res) {
    
    const productID = +req.body.productid;          
    await CartModel.removeProductFromCart(1, productID);
    res.redirect('/cart');

    
});

router.get('/cart', async function (req, res) {
    const cart = await CartModel.findById(1);
    const products = await cart.getProducts();

    res.render('cart.html', {
        products,
        cart,
    });
});

router.get('/discount', async function (req, res) {
    const productsWithDiscount = await ProductModel.getAllDiscount();

    res.render('discount.html', { products: productsWithDiscount });
});

router.get('/formulario', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'formulario.html'));
});

module.exports = router;
