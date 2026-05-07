describe('Login and Register', () => {
  const user = {
    name: 'Juan Perez',
    email: `juan_perez_test@elpoli.edu.co`,
    password: 'Juan123*',
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('debería iniciar sesión correctamente y cerrar sesión correctamente', () => {
    cy.get('.primary-btn').click();

    cy.get('[name="email"]').type('juan_estrada82212@elpoli.edu.co');

    cy.get('[name="password"]').type('P@ssw0rd');

    cy.get('button').click();

    cy.url().should('include', '/dashboard');

    cy.get('.login-btn').click();

    cy.url().should('include', '/login');
  });

  it('debería de registrarse el usuario de prueba correctamente.', () => {
    cy.get('.secondary-btn').click();

    cy.get('[name="fullName"]').type(user.name);

    cy.get('[name="email"]').type(user.email);

    cy.get('[name="password"]').type(user.password);

    cy.get('[name="confirmPassword"]').type(user.password);

    cy.get('button').click();

    cy.contains('Usuario Registrado!');
  });

  after(() => {
    cy.request({
      method: 'DELETE',
      url: `https://herramientadiapositivaspoli-backend.onrender.com/api/users/test/deleteTestUser`,
    });
  });
});
