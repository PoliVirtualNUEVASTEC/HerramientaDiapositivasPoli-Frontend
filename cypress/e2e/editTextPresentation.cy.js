describe('Consultar historial de presentaciones', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/login');
    cy.login();
  });

  it('Entrar a la primera presentación y cambiar el texto del primer slide.', () => {
    cy.intercept('GET', '**/api/presentations/').as('loadPresentations');

    cy.wait('@loadPresentations').its('response.statusCode').should('eq', 200);
    cy.get(
      ':nth-child(1) > .dashboard-presentation-actions > .dashboard-view-btn',
    ).click();
    cy.get('.edit-btn').click();
    cy.get('h2').click().click();
    cy.get('textarea')
      .clear()
      .type('contenido cambiado para la prueba número 8');
    cy.get('.slide-canvas').click();
  });

  it('modificar estilos del elemento cambiado', () => {
    cy.intercept('GET', '**/api/presentations/').as('loadPresentations');

    cy.wait('@loadPresentations').its('response.statusCode').should('eq', 200);
    cy.get(
      ':nth-child(1) > .dashboard-presentation-actions > .dashboard-view-btn',
    ).click();
    cy.get('.edit-btn').click();
    cy.get('h2').click();
    cy.get('.font-size-group > :nth-child(3)').click(5);
    cy.get('.edit-toolbar-buttons > :nth-child(8)').click();
    cy.get('.font-menu-container > .toolbar-button').click();
    cy.get('.font-menu-popup > :nth-child(6)').click();

    cy.get('.back-btn').click();
    cy.contains('Presentación guardada');
  });

  after(() => {
    cy.get('.edit-btn').click();
    cy.get('h2').click().click();
    cy.get('textarea').clear().type('texto a cambiar para la prueba');
    cy.get('.slide-canvas').click();

    cy.get('h2').click();
    cy.get('.font-size-group > :nth-child(1)').click(5);
    cy.get('.edit-toolbar-buttons > .active').click();
    cy.get('.font-menu-container > .toolbar-button').click();
    cy.get('[style="font-family: Arial;"]').click();
    cy.get('.slide-canvas').click();
  });
});
