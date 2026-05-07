describe('Login and Register', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.login();
  });

  it('se debe de subir un archivo válido y generar la presentación en base a este', () => {
    cy.get('input[type=file]').selectFile(
      'cypress/fixtures/Analisis_IA_Etica_Laboral_Academico.pdf',
      {
        force: true,
      },
    );

    cy.get('.file-name').should('be.visible');

    cy.get('.slides-counter-input').clear().type('5');

    cy.intercept('POST', '**/api/presentations/pdf').as('generatePresentation');

    cy.get('.generate-btn').click();

    cy.wait('@generatePresentation')
      .its('response.statusCode')
      .should('eq', 201);

    cy.get('.present-btn').should('be.visible');
  });
});
