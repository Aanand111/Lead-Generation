const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const setupSwagger = (app) => {
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

    // Allow passing the API docs path via environment variable, defaults to /api-docs
    const apiDocsPath = process.env.API_DOCS_PATH || '/api-docs';

    app.use(apiDocsPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log(`Swagger Docs mapped to ${apiDocsPath}`);
};

module.exports = setupSwagger;
