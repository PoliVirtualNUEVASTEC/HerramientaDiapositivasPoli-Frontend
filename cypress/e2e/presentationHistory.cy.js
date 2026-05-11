describe('Consultar historial de presentaciones', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/login');
    cy.login();
  });

  it('al entrar al dashboad se deben cargar las presentaciones anteriormente generadas', () => {
    cy.intercept('GET', '**/api/presentations/').as('loadPresentations');

    cy.wait('@loadPresentations').its('response.statusCode').should('eq', 200);
    cy.contains('Mis presentaciones');

    cy.get(
      ':nth-child(1) > .dashboard-presentation-info > .dashboard-presentation-title',
    )
      .invoke('text')
      .then((title) => {
        cy.get(
          ':nth-child(1) > .dashboard-presentation-actions > .dashboard-view-btn',
        ).click();

        cy.get('h1').should(($el) => {
          expect($el.text().trim()).to.equal(title.trim());
        });
      });
  });
});
