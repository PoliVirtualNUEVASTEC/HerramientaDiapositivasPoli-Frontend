describe('Exportar presentación', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/login');
    cy.login();
  });

  it('Crear diapositivas', () => {
    cy.get('.dashboard-view-btn').eq(1).click();

    cy.url().should('include', '/preview');

    cy.get('.edit-btn').click();

    cy.url().should('include', '/edit');

    cy.get('.slide-insert-button').last().click();

    cy.wait(20000);
  });

  it('Eliminar diapositiva', () => {
    cy.get('.dashboard-view-btn').eq(1).click();

    cy.url().should('include', '/preview');

    cy.get('.edit-btn').click();

    cy.url().should('include', '/edit');

    cy.get('.slide-list-item').eq(-2).realHover();

    cy.get('.slide-menu-trigger').eq(-2).click();

    cy.get('.delete').click();
  });
});
