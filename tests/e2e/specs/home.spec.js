describe('Home Test', () => {
    // Limpio la db antes de cada test
    beforeEach(() => {
        cy.task('seed');
    });

    it('Deberia tener de titulo Shopp', () => {
        cy.visit('/');
        cy.title().should('eq', 'Shopp');
    });

    it('Deberia mostrar 10 productos', () => {
        cy.visit('/');

        cy.get('.product').should('have.length', 10);
    });

    it('El primer producto deberia ser "Barra de sonido"', () => {
        cy.visit('/');

        cy.get('.product .card-title').first().should(
            'have.text',
            'Barra de sonido'
        );
    });

    it('Deberia mostrarse el páginador si es necesario', () => {
        cy.visit('/');

        cy.get('.pagination').should('be.visible')
    });

    it('Deberia poder paginar', () => {
        cy.visit('/');

        cy.get('.pagination__next').click()
        cy.get('.product').should('have.length', 2);
    });

    it('Deberia mostrar el primer producto con descuento', () => {
        cy.visit('/');

        cy.get(':nth-child(1) > .product >.card-body > .ms-3 > [data-testid="discount"]')
            .should('contain.text', '5 %');
    });
    it('Deberia mostrar el footer en el home', () => {
        cy.visit('/');

        cy.get('footer > .navbar').should('be.visible');
    });


    it('Deberia no mostrar el boton previous en la primer pagina ', () => {
        cy.visit('/');
        cy.get('.pagination__next > a').click();
        cy.get('.pagination__prev > a').click();
        cy.get('.pagination__prev > a').should('not.exist');

    });



    it('Deberia no mostrar el boton next en la ultima pagina ', () => {
        cy.visit('/');
        cy.get('.pagination__next > a').click();
        cy.url().should('include', 'page=2');
        cy.get('.pagination__next > a').should('not.exist');

    });

    it('Deberia mostrar todos los filtros de categoria', () => {
        cy.visit('/');

        cy.get('#type option').should('have.length.gt', 1)
    });

    it('Deberia poder filtrar por una categoria determinada', () => {
        cy.visit('/');

        cy.get('#type option:nth-child(2)').should('have.text', 'electronics');

        cy.get('#type').select(1);
        cy.get('#btn-filter').click();

        cy.get('.product').should('have.length', 5);
    });
});



