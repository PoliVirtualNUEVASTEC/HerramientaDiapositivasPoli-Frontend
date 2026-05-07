describe('Login and Register', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.login();
  });

  it('debería de validar que se suba un archivo antes de generar', () => {
    cy.get('.generate-btn').click();
    cy.contains('Debes seleccionar un archivo PDF');
  });

  it('el archivo seleccionado debe de ser un PDF', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/imagenTest.jpg', {
      force: true,
    });
    cy.contains('Solo se permiten archivos PDF');
  });

  it('el archivo seleccionado debe de ser un PDF menor a 3BM', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/archivo3MB.pdf', {
      force: true,
    });
    cy.contains('El archivo supera los 3MB');
  });

  it('el archivo seleccionado debe subirse correctamente', () => {
    cy.get('input[type=file]').selectFile(
      'cypress/fixtures/Analisis_IA_Etica_Laboral_Academico.pdf',
      {
        force: true,
      },
    );
    cy.get('.file-name').should('be.visible');
  });
});
