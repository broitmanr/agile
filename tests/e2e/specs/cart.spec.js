describe('Cart', () => {
    // Limpio la db antes de cada test
    beforeEach(() => {
        cy.task('seed');
    });

    it('Deberia iniciar vacio', () => {
        cy.visit('/cart');
        cy.get('.product').should('have.length', 0);
    });

    it('Deberia poder agregar un item al carrito', () => {
        cy.visit('/');

        cy.get(':nth-child(2) > .card-body > .flex-grow-1 > form > .btn').click();
        cy.get('.product').should('have.length', 1);
        cy.get('.product .product__quantity').should(
            'contain.text',
            '1 en carrito'
        );

        cy.get('.navbar-brand').click();

        cy.get(':nth-child(2) > .card-body > .flex-grow-1 > form > .btn').click();
        cy.get('.product').should('have.length', 1);
        cy.get('.product .product__quantity').should(
            'contain.text',
            '2 en carrito'
        );

        cy.get('.navbar-brand').click();

        cy.get(':nth-child(3) > .card-body > .flex-grow-1 > form > .btn').click();
        cy.get('.product').should('have.length', 2);

        cy.get(':nth-child(3) .product__quantity').should(
            'contain.text',
            '2 en carrito'
        );

        cy.get(':nth-child(2) .product__quantity').should(
            'contain.text',
            '1 en carrito'
        );
    });

    it('Deberia mostrar 2 productos con descuento en la pagina de descuento', () => {
        cy.visit('/discount');
        cy.get('.product').should('have.length', 2)
        cy.get('.product:nth-child(1) [data-testid="discount"]')
            .should('have.text', '5 %')

        cy.get('.product:nth-child(2) [data-testid="discount"]')
            .should('have.text', '10 %')
    });

    it('Deberia poder agregar y borrar items de un carrito', () => {
        cy.visit('/');
        //Agrega al carrito el primer item del home
        cy.get(':nth-child(2) > .card-body > .flex-grow-1 > form > .btn').click();
        //Vuelve al home
        cy.get('.navbar-brand').click();
        //Agrega el mismo producto
        cy.get(':nth-child(2) > .card-body > .flex-grow-1 > form > .btn').click();

        //Vuelve al home 
        cy.get('.navbar-brand').click();
        //Agrega al segundo producto
        cy.get(':nth-child(3) > .card-body > .flex-grow-1 > form > .btn').click();
        //Verifica el tamaño de la coleccion 
        cy.get('.product').should('have.length', 2);
        //Verifica que del primer producto haya 2 
        cy.get(':nth-child(3) .product__quantity').should(
            'contain.text',
            '2 en carrito'
        );
        //Verifica que del segundo producto haya 1
        cy.get(':nth-child(2) .product__quantity').should(
            'contain.text',
            '1 en carrito'
        );
        //Elimina 1 del primer producto
        cy.get(':nth-child(2) > .card-body > .flex-grow-1 > .mt-auto > form > .btn > .fa').click();
        //verifica que el tamaño de la coleccion sigue siendo 2 
        cy.get('.product').should('have.length', 2);
        //Verifica que el primer producto tiene cantidad 1
        cy.get(':nth-child(2) .product__quantity').should(
            'contain.text',
            '1 en carrito'
        );
        //El elimina 1 del segundo producto
        cy.get(':nth-child(1) > .card-body > .flex-grow-1 > .mt-auto > form > .btn > .fa').click();
        //verifica que el tamaño de la coleccion sea 1
        cy.get('.product').should('have.length', 1);


    });


});
