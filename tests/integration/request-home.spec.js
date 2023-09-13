const fetch = require('node-fetch');

const server = require('../../src/index.js');
const fixture = require('../../fixtures/index.js');


let instance;

beforeEach(async () => {
    await fixture.insertIntoDB();
    instance = await server.start();
});

afterEach(async () => {
    await instance.close();
});

test('Deberia retornar 200 ok cuando se hace un request a la home', async () => {
    const port = instance.address().port;
    const resp = await fetch(`http://localhost:${port}/`);
    expect(resp.status).toBe(200);
});

//Test no es mas requerido debido a que se genera un css customizado
//a partir de bootstrap
// test('Deberia utilizar bootstrap 5.2', async () => {
//     const port = instance.address().port;
//     const resp = await fetch(`http://localhost:${port}/`);
//     const html = await resp.text();
//     expect(html).toMatch('bootstrap@5.2.0');
// });

test('Deberia Aparecer el total en 0 cuando se va al carrito sin agregar', async () => {
    const port = instance.address().port;
    const resp = await fetch(`http://localhost:${port}/cart`);
    const html = await resp.text();

    expect(html).toMatch('Total');
});

test('Deberia aparecer cama cuando el request tiene productid 6', async () => {
    const port = instance.address().port;
    const params = new URLSearchParams();
    params.append('productid',6);
    const resp = await fetch(`http://localhost:${port}/cart`,{method:'POST',
                                body:params,
                                });
    const html = await resp.text();
    expect(html).toMatch('Cama');
});

test('Deberia quedar total 0 si se elimina el producto del carrito ', async () => {
    const port = instance.address().port;
    const params = new URLSearchParams();
    params.append('productid',6);
    await fetch(`http://localhost:${port}/cart`,{method:'POST',
                                body:params,
                                });
    const resp = await fetch(`http://localhost:${port}/discard`,{method:'POST',
                                body:params,
                                });                            
    const html = await resp.text();
    expect(html).toMatch('Total $ 0');
});