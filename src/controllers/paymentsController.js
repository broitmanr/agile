class PaymentController {
    constructor(subscriptionService){
        this.subscriptionService = subscriptionService;
    }

    async getPaymentLink(req, res, product, categoria){
        try {
            //Request de los pagos unicos
            const payment = await this.subscriptionService.createPayment(product, categoria);

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