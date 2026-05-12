describe('Exportar presentación', () => {
  beforeEach(() => {
    cy.visit('/login');

    cy.get('[name="email"]').type('juan_estrada82212@elpoli.edu.co');

    cy.get('[name="password"]').type('P@ssw0rd');

    cy.get('button').click();

    cy.url().should('include', '/dashboard');
  });

  it('Debe exportar la presentación a PDF correctamente', () => {
    cy.get('.dashboard-view-btn').first().click();

    cy.url().should('include', '/preview');

    cy.contains('Exportar').click();

    cy.contains('PDF').click();

    cy.wait(20000);
  });
  it('Debe exportar la presentación a PPTX correctamente', () => {
    cy.get('.dashboard-view-btn').first().click();

    cy.url().should('include', '/preview');

    cy.contains('Exportar').click();

    cy.contains('PPTX').click();
  });
});
