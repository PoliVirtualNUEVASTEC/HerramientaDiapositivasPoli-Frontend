describe('Exportar presentación', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/login');
    cy.login();
  });

  it('Reordenar diapositivas', () => {
    cy.get('.dashboard-view-btn').eq(1).click();

    cy.url().should('include', '/preview');

    cy.get('.edit-btn').click();

    cy.url().should('include', '/edit');

    cy.get('.slide-list-item').should('have.length.greaterThan', 1);

    const dataTransfer = new DataTransfer();
    cy.get(':nth-child(1) > .slide-list-item').trigger('dragstart', {
      dataTransfer,
      force: true,
    });

    cy.get(':nth-child(2) > .slide-list-item')
      .trigger('dragover', { dataTransfer, force: true })
      .trigger('drop', { dataTransfer, force: true });

    cy.get(':nth-child(1) > .slide-list-item').trigger('dragend', {
      force: true,
    });
  });
});
