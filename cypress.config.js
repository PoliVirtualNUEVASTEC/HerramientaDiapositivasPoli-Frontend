import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '9inc15',
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://presentai.juajsia.lat',
  },
});
