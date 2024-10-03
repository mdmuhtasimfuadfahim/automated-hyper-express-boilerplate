import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import logger from '../config/log4js.js';

dotenv.config();

const PORT = process.env.PORT || 4080;
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const protectedRoutes = [
  '/v0.5/auth/reset-password',
  '/v0.5/auth/send-verification-email',
  '/v0.5/auth/verify-email',
];

async function loadRoutesFromModules(directory, baseRoute = '') {
  const routes = [];
  const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of filesAndFolders) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      // Skip the 'skipFolderName' directory under 'modules/v0.5'
      if (entry.name === 'helper' && baseRoute === '/v0.5') {
        continue;
      }

      let updatedBaseRoute = baseRoute + '/' + entry.name;
      const subRoutes = await loadRoutesFromModules(fullPath, updatedBaseRoute);
      routes.push(...subRoutes);
    } else {
      let [routeName] = entry.name.split('.');
      let method;

      switch (routeName) {
        case 'get':
          method = 'get';
          routeName = '';
          break;
        case 'create':
          method = 'post';
          routeName = '';
          break;
        case 'update':
          method = 'patch';
          routeName = '';
          break;
        case 'delete':
          method = 'delete';
          routeName = '';
          break;
        case 'register':
        case 'login':
        case 'logout':
        case 'refresh-tokens':
        case 'forgot-password':
        case 'reset-password':
        case 'send-verification-email':
        case 'verify-email':
          method = 'post';
          break;
        default:
          logger.warn(`Unknown route name: ${routeName}`);
          continue;
      }

      const routePath = `${baseRoute}${routeName ? '/' + routeName : ''}`;
      routes.push({ method, path: routePath, file: fullPath });
    }
  }
  return routes;
}

function extractValidationSchema(fileContent, schemaName) {
  const ast = parse(fileContent, { sourceType: 'module', ecmaVersion: 2020 });
  let schema = {};

  walkSimple(ast, {
    VariableDeclarator(node) {
      if (node.id.name === schemaName && node.init && node.init.arguments) {
        const properties = node.init.arguments[0].properties;
        properties.forEach((prop) => {
          schema[prop.key.name] =
            prop.value.type === 'CallExpression'
              ? prop.value.callee.property.name
              : 'sample';
        });
      }
    },
  });

  return schema;
}

function generateSampleData(schema) {
  const sampleData = {};
  for (const key in schema) {
    switch (schema[key]) {
      case 'string':
        sampleData[key] = 'sample string';
        break;
      case 'email':
        sampleData[key] = 'sample@example.com';
        break;
      case 'min':
        sampleData[key] = 'samplepassword';
        break;
      default:
        sampleData[key] = 'sample';
    }
  }
  return sampleData;
}

function generateTestScript(schema) {
  const testScript = [];

  for (const key in schema) {
    switch (schema[key]) {
      case 'string':
        testScript.push(
          `pm.test("Response should have property '${key}' of type string", function () {`,
        );
        testScript.push(
          `    pm.expect(pm.response.json()).to.have.property('${key}');`,
        );
        testScript.push(
          `    pm.expect(pm.response.json().${key}).to.be.a('string');`,
        );
        testScript.push(`});`);
        break;
      case 'email':
        testScript.push(
          `pm.test("Response should have property '${key}' of type email", function () {`,
        );
        testScript.push(
          `    pm.expect(pm.response.json()).to.have.property('${key}');`,
        );
        testScript.push(
          `    pm.expect(pm.response.json().${key}).to.be.a('string');`,
        );
        testScript.push(
          `    pm.expect(pm.response.json().${key}).to.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/);`,
        );
        testScript.push(`});`);
        break;
      case 'min':
        testScript.push(
          `pm.test("Response should have property '${key}' of type string with minimum length", function () {`,
        );
        testScript.push(
          `    pm.expect(pm.response.json()).to.have.property('${key}');`,
        );
        testScript.push(
          `    pm.expect(pm.response.json().${key}).to.be.a('string');`,
        );
        testScript.push(
          `    pm.expect(pm.response.json().${key}.length).to.be.at.least(8);`,
        );
        testScript.push(`});`);
        break;
      default:
        testScript.push(
          `pm.test("Response should have property '${key}'", function () {`,
        );
        testScript.push(
          `    pm.expect(pm.response.json()).to.have.property('${key}');`,
        );
        testScript.push(`});`);
    }
  }

  return testScript;
}

async function generatePostmanCollection() {
  const routes = await loadRoutesFromModules(
    path.join(__dirname, '../modules'),
  );

  const postmanCollection = {
    info: {
      name: 'Hyper Express Boilerplate API Collection',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      {
        key: 'base_url',
        value: `http://localhost:${PORT}`,
        type: 'string',
      },
      {
        key: 'bearer_token',
        value: '',
        type: 'string',
      },
    ],
    item: [],
  };

  const folders = {};

  for (const route of routes) {
    const { method, path: routePath, file } = route;
    const folderName = routePath.split('/')[2] || 'root';
    if (!folders[folderName]) {
      folders[folderName] = {
        name: folderName,
        item: [],
      };
      postmanCollection.item.push(folders[folderName]);
    }

    const request = {
      name: `${method.toUpperCase()} ${routePath}`,
      request: {
        method: method.toUpperCase(),
        header: [],
        body: {
          mode: 'raw',
          raw: '{}',
          options: {
            raw: {
              language: 'json',
            },
          },
        },
        url: {
          raw: `{{base_url}}${routePath}`,
          host: ['{{base_url}}'],
          path: routePath.split('/').filter(Boolean),
        },
      },
      event: [],
    };

    // Add Authorization header and auth section if the route is protected or not in the auth directory
    if (
      protectedRoutes.includes(routePath) ||
      !routePath.startsWith('/v0.5/auth')
    ) {
      request.request.header.push({
        key: 'Authorization',
        value: 'Bearer {{bearer_token}}',
        type: 'text',
      });
      request.request.auth = {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{bearer_token}}',
            type: 'string',
          },
        ],
      };
    }

    // Read the file to extract the controller function name
    const fileContent = fs.readFileSync(file, 'utf-8');
    const importMatch = fileContent.match(
      /import (\w+) from '.*\/(\w+)\.controller\.js';/,
    );
    if (importMatch) {
      const controllerName = importMatch[1];
      const controllerFunctionMatch = fileContent.match(
        new RegExp(`${controllerName}\\.(\\w+)\\(req, res\\)`),
      );
      if (controllerFunctionMatch) {
        const controllerFunctionName = controllerFunctionMatch[1];
        const controllerFilePath = path.join(
          __dirname,
          '../controllers/v0.5',
          `${folderName}.controller.js`,
        );
        if (fs.existsSync(controllerFilePath)) {
          const controllerFileContent = fs.readFileSync(
            controllerFilePath,
            'utf-8',
          );
          const controllerAst = parse(controllerFileContent, {
            sourceType: 'module',
            ecmaVersion: 2020,
          });

          let validationSchemaName = null;

          walkSimple(controllerAst, {
            Property(node) {
              if (node.key.name === controllerFunctionName) {
                walkSimple(node, {
                  CallExpression(innerNode) {
                    if (
                      innerNode.callee.property &&
                      innerNode.callee.property.name === 'parse'
                    ) {
                      validationSchemaName = innerNode.callee.object.name;
                    }
                  },
                });
              }
            },
          });

          if (validationSchemaName) {
            const validationFilePath = path.join(
              __dirname,
              '../validations',
              `${folderName}.validation.js`,
            );
            if (fs.existsSync(validationFilePath)) {
              const validationFileContent = fs.readFileSync(
                validationFilePath,
                'utf-8',
              );
              const schema = extractValidationSchema(
                validationFileContent,
                validationSchemaName,
              );
              const sampleData = generateSampleData(schema);
              request.request.body.raw = JSON.stringify(sampleData, null, 2);

              const testScript = generateTestScript(schema);
              request.event.push({
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: testScript,
                },
              });
            }
          }
        }
      }
    }

    folders[folderName].item.push(request);
  }

  fs.writeFileSync(
    path.join(
      __dirname,
      '../docs/Hyper Express Integration Test.postman_collection.json',
    ),
    JSON.stringify(postmanCollection, null, 2),
    { encoding: 'utf8', flag: 'w', mode: 0o666 },
  );
  logger.info('Postman collection generated!');
}

generatePostmanCollection();
