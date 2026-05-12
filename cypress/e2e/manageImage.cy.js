describe('Agregar y Eliminar Imágenes', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/login');
    cy.login();
  });

  it('Entrar a la primera presentación y subir una imagen.', () => {
    cy.intercept('GET', '**/api/presentations/').as('loadPresentations');

    cy.wait('@loadPresentations').its('response.statusCode').should('eq', 200);
    cy.get(
      ':nth-child(1) > .dashboard-presentation-actions > .dashboard-view-btn',
    ).click();

    cy.get('.edit-btn').click();
    cy.get('[title="AgregarImagen"]').click();

    cy.intercept('POST', '**/api/user-images').as('uploadImage');
    cy.get('input[type=file]').selectFile('cypress/fixtures/imagenTest.jpg', {
      force: true,
    });

    cy.wait('@uploadImage').its('response.statusCode').should('eq', 201);
    cy.get('[title="AgregarImagen"]').click();

    cy.intercept('POST', '**/api/slide-elements').as('insertImage');
    cy.get(':nth-child(1) > .image-history-card-preview > img').click();

    cy.wait('@insertImage').its('response.statusCode').should('eq', 201);
  });

  it('Borrar la imáge recién incertada y borrarla de la biblioteca de imágenes', () => {
    cy.intercept('GET', '**/api/presentations/').as('loadPresentations');

    cy.wait('@loadPresentations').its('response.statusCode').should('eq', 200);
    cy.get(
      ':nth-child(1) > .dashboard-presentation-actions > .dashboard-view-btn',
    ).click();

    cy.get('.edit-btn').click();

    cy.get(
      '[style="position: absolute; left: 80px; top: 120px; width: 280px; height: 180px; outline: none; box-sizing: border-box; cursor: default; display: flex; align-items: stretch; justify-content: stretch;"]',
    ).click({ force: true });

    cy.get('body').type('{del}');

    cy.get('[title="AgregarImagen"]').click();
    cy.get(':nth-child(1) > .image-history-card-preview > img').trigger(
      'mouseover',
    );

    cy.get(':nth-child(1) > .image-history-card-delete').click();
    cy.get(
      '[style="background: rgb(17, 17, 17); color: white; border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background 0.15s;"]',
    ).click();
  });
});
