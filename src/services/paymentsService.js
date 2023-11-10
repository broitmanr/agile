const axios = require('axios');

class PaymentService {
    async createPayment(product) {
        const url = 'https://api.mercadopago.com/checkout/preferences';

        const body = {
            payer_email: 'test_user_1685160373@testuser.com',
            items: [
                {
                    title: `${product.nombre}`,
                    description: `${product.detalle}`,
                    picture_url: `${product.urlImagen}`,
                    category_id: `${product.categoria.nombre}`,
                    quantity: 1,
                    unit_price: product.precio
                }
            ],
            back_urls: {
                success: `http://localhost:3000/details_success/${product.id}`,
                failure: 'http://localhost:3000/_product_details_failure.html',
                pending: 'http://localhost:3000/_product_details_pending.html'
            },
        };

        const payment = await axios.post(url, body, {
            headers: {
                'content-Type': '',
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        return payment.data;
    }
}

module.exports = PaymentService;