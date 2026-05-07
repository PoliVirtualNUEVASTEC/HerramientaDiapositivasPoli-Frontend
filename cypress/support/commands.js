Cypress.Commands.add('login', () => {
  cy.get('[name="email"]').type('juan_estrada82212@elpoli.edu.co');

  cy.get('[name="password"]').type('P@ssw0rd');

  cy.get('button').click();
});
