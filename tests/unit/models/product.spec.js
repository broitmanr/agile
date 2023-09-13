const ProductModel = require('../../../src/models/product.js');
const ProductType = require('../../../src/models/productType.js');

beforeEach(async () => {
    await ProductModel.Product.sync({ force: true });
});

test('Crear producto', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
        description: 'Para guardar objetos',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    expect(product.price).toBe(productData.price);
    expect(product.type).toBe(productData.type);
    expect(product.name).toBe(productData.name);
    expect(product.description).toBe(productData.description);
});

test('Crear producto sin descripcion', async () => {
    const productData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.HOME,
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    expect(product.price).toBe(productData.price);
    expect(product.type).toBe(ProductType.HOME);
    expect(product.name).toBe(productData.name);
    expect(product.description).toBe('');
});

test('Crear producto sin tipo', async () => {
    const productData = {
        price: 1000.0,
        name: 'Tostadora',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    expect(product.price).toBe(productData.price);
    expect(product.type).toBe(ProductType.HOME);
    expect(product.name).toBe(productData.name);
});

test('Crear producto vacio', async () => {
    // Creamos el producto
    const product = await ProductModel.create();

    expect(product.name).toBe('');
    expect(product.price).toBe(0.0);
    expect(product.type).toBe(ProductType.HOME);
    expect(product.discount).toBe(0.0);
    expect(product.description).toBe('');
    
   
});

test('Listar productos sin resultados', async () => {
    const products = await ProductModel.getAll();

    expect(products).not.toBeNull();
    expect(products.rows.length).toBe(0);
});

test('Listar productos con resultados', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos el producto
    await ProductModel.create(productData);

    const products = await ProductModel.getAll();

    expect(products).not.toBeNull();
    expect(products.rows.length).toBe(1);
});

test('Listar productos con limite', async () => {
    const firstProductData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    const secondProductData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.ELECTRONICS,
    };

    // Creamos los productos
    const product = await ProductModel.create(firstProductData);
    await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll(1);

    // La lista de productos debería contener solo el primero
    expect(products.rows.length).toBe(1);
    expect(products.rows[0].id).toBe(product.id);
});

test('Listar productos con limite y offset', async () => {
    const firstProductData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    const secondProductData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.ELECTRONICS,
    };

    // Creamos los productos
    await ProductModel.create(firstProductData);
    const product = await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll(1, 1);

    // La lista de productos debería contener solo el segundo
    expect(products.rows.length).toBe(1);
    expect(products.rows[0].id).toBe(product.id);
});

test('Listar productos en orden', async () => {

    const nombreSegundoProducto = 'Lustradora';

    const firstProductData = {
        price: 25000.0,
        type: ProductType.HOME,
        name: 'Tetera',
    };

    const secondProductData = {
        price: 4000.0,
        name: nombreSegundoProducto,
        type: ProductType.ELECTRONICS,
    };

    // Creamos ambos productos
    await ProductModel.create(firstProductData);
    await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll();

    // La lista de productos debería tener en primer lugar el segundo producto agregado
    expect(products.rows[0].name).toBe(nombreSegundoProducto);
});

test('Filtrar productos por tipo home', async () => {
    const firstProductData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    const secondProductData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.ELECTRONICS,
    };

    // Creamos los productos
    const product = await ProductModel.create(firstProductData);
    await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll(null, null, ProductType.HOME);

    // La lista de productos debería contener solo el primero
    expect(products.rows.length).toBe(1);
    expect(products.rows[0].id).toBe(product.id);
});

test('Filtrar productos por tipo electronics', async () => {
    const firstProductData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    const secondProductData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.ELECTRONICS,
    };

    // Creamos los productos
    await ProductModel.create(firstProductData);
    const product = await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll(
        null,
        null,
        ProductType.ELECTRONICS
    );

    // La lista de productos debería contener solo el segundo
    expect(products.rows.length).toBe(1);
    expect(products.rows[0].id).toBe(product.id);
});

test('Filtrar productos por tipo inexistente', async () => {
    const firstProductData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    const secondProductData = {
        price: 1000.0,
        name: 'Tostadora',
        type: ProductType.ELECTRONICS,
    };

    // Creamos los productos
    await ProductModel.create(firstProductData);
    await ProductModel.create(secondProductData);

    let products = await ProductModel.getAll(null, null, 'fake');

    // La lista de productos debería estar vacía
    expect(products.rows.length).toBe(0);
});

test('Editar producto', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    // El nombre debería ser el creado
    expect(product.name).toBe(productData.name);

    const updateData = {
        name: 'Ropero',
    };

    // Modificamos nombre del producto
    const productUpdated = await ProductModel.update(product.id, updateData);

    // La función debería retornar algo
    expect(productUpdated).not.toBeNull();

    // El nombre debería ser el modificado
    expect(productUpdated.name).toBe('Ropero');
});

test('Editar producto inexistente', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    // El nombre debería ser el creado
    expect(product.name).toBe(productData.name);

    const updateData = {
        name: 'Ropero',
    };

    // Modificamos producto inexistente
    const productUpdated = await ProductModel.update(2, updateData);

    // La función debería retornar null
    expect(productUpdated).toBeNull();

    const products = await ProductModel.getAll();

    // El nombre debería seguir siendo el mismo
    expect(products.rows[0].name).toBe(productData.name);
});

test('Editar producto para que quede vacio', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.ELECTRONICS,
        name: 'Placard',
        discount:5.0,
        description:'Para guardar',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);
    
    // Modificamos el producto
    const productUpdated = await ProductModel.update(product.id, {} );

    // La función debería retornar algo
    expect(productUpdated).not.toBeNull();
    expect(productUpdated.id).toBe(product.id)
    expect(productUpdated.name).toBe('');
    expect(productUpdated.price).toBe(0.0);
    expect(productUpdated.type).toBe(ProductType.HOME);
    expect(productUpdated.discount).toBe(0.0);
    expect(productUpdated.description).toBe('');
});

test('Eliminar producto', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos el producto
    const product = await ProductModel.create(productData);

    // Buscamos todos los productos
    let products = await ProductModel.getAll();

    // Debe existir un producto en la lista
    expect(products.rows.length).toBe(1);

    // Eliminamos producto
    const deleted = await ProductModel.delete(product.id);

    // La función debería retornar algo
    expect(deleted).not.toBeNull();

    products = await ProductModel.getAll();

    // No deben haber productos en la lista
    expect(products.rows.length).toBe(0);
});

test('Eliminar producto inexistente', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos un producto
    await ProductModel.create(productData);

    // Buscamos todos los productos
    let products = await ProductModel.getAll();

    // Debe existir un producto en la lista
    expect(products.rows.length).toBe(1);

    // Eliminamos producto inexistente
    const deleted = await ProductModel.delete(2);

    // La función debería retornar null
    expect(deleted).toBeNull();

    products = await ProductModel.getAll();

    // El producto debería seguir existiendo en la lista
    expect(products.rows.length).toBe(1);
});

test('Listar productos con descuento', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
        discount: 10,
    };

    // Creamos el producto
    await ProductModel.create(productData);

    const products = await ProductModel.getAllDiscount();

    expect(products.length).toBe(1);
    expect(products[0].discount).toBeGreaterThan(0);
});

test('Listar productos con descuento cuando no hay ninguno', async () => {
    const productData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
    };

    // Creamos el producto
    await ProductModel.create(productData);

    const products = await ProductModel.getAllDiscount();

    expect(products.length).toBe(0);
});

test('Listar productos con descuento cuando tengo 1 sin descuento', async () => {
    const productFirstData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Placard',
        discount: 10,
    };

    const productSecondData = {
        price: 50000.0,
        type: ProductType.HOME,
        name: 'Mesa',
    };

    // Creamos los productos
    await ProductModel.create(productFirstData);
    await ProductModel.create(productSecondData);

    const products = await ProductModel.getAllDiscount();

    expect(products.length).toBe(1);
    expect(products[0].discount).toBeGreaterThan(0);
    expect(products[0].name).toBe(productFirstData.name);
});