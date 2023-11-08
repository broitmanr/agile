class PaymentController {
    constructor(subscriptionService){
        this.subscriptionService = subscriptionService;
    }

    async getPaymentLink(req, res, product, diasAlquiler){
        try {
            //Request de los pagos unicos
            const payment = await this.subscriptionService.createPayment(product, diasAlquiler);
            return res.send(payment);
        } catch (error) {
            console.log(error);

            return res
                .status(500)
                .json({ error: true, msg: 'Failed to create payment' });
        }
    }
}

module.exports = PaymentController;