import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import logger from '../config/log4js.js';

dotenv.config();

const PORT = process.env.PORT || 4080;
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Auto-generated API documentation',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
};

async function loadRoutesFromModules(directory, baseRoute = '') {
  const routes = [];
  const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of filesAndFolders) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      let updatedBaseRoute = baseRoute + '/' + entry.name;
      const subRoutes = await loadRoutesFromModules(fullPath, updatedBaseRoute);
      routes.push(...subRoutes);
    } else {
      let [routeName] = entry.name.split('.');
      let method;

      switch (routeName) {
        case 'get':
          method = 'get';
          routeName = ''; // Remove the action from the route path
          break;
        case 'create':
          method = 'post';
          routeName = ''; // Remove the action from the route path
          break;
        case 'update':
          method = 'patch';
          routeName = ''; // Remove the action from the route path
          break;
        case 'delete':
          method = 'delete';
          routeName = ''; // Remove the action from the route path
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
      routes.push({ method, path: routePath });
    }
  }
  return routes;
}

async function getValidationSchema(validationPath, method) {
  if (fs.existsSync(validationPath)) {
    const validation = await import(pathToFileURL(validationPath).href);
    const schema = validation[`${method}Schema`];
    if (schema) {
      return schema;
    }
  }
  return null;
}

async function generateSwaggerDocs() {
  const apiDocs = { ...swaggerDefinition, paths: {} };

  const routes = await loadRoutesFromModules(
    path.join(__dirname, '../modules'),
  );

  for (const route of routes) {
    const { method, path: routePath } = route;
    let controllerPath;
    let validationPath;

    // Check if the route is part of the auth module
    if (routePath.startsWith('/v0.5/auth')) {
      controllerPath = path.join(
        __dirname,
        '../controllers/v0.5/auth.controller.js',
      );
      validationPath = path.join(
        __dirname,
        '../validations/auth.validation.js',
      );
    } else {
      controllerPath = path.join(
        __dirname,
        '../controllers/v0.5',
        `${routePath.split('/')[2]}.controller.js`,
      );
      validationPath = path.join(
        __dirname,
        '../validations',
        `${routePath.split('/')[2]}.validation.js`,
      );
    }

    let requestBody = {};
    let parameters = [];
    let responses = {
      200: {
        description: 'Successful Response',
      },
    };

    logger.log(`Processing route: [${method.toUpperCase()}] ${routePath}`); // Debugging line

    if (fs.existsSync(controllerPath)) {
      const controller = await import(pathToFileURL(controllerPath).href);
      const handler = controller.default[method];

      if (handler) {
        const handlerString = handler.toString();
        const bodyMatch = handlerString.match(/req\.body\.(\w+)/g);
        if (bodyMatch) {
          const schema = await getValidationSchema(validationPath, method);
          if (schema) {
            requestBody = {
              content: {
                'application/json': {
                  schema: schema._def.shape(),
                },
              },
            };
          } else {
            requestBody = {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            };
            bodyMatch.forEach((match) => {
              const prop = match.split('.')[2];
              requestBody.content['application/json'].schema.properties[prop] =
                { type: 'string' };
            });
          }
        }

        const paramMatch = handlerString.match(/req\.params\.(\w+)/g);
        if (paramMatch) {
          paramMatch.forEach((match) => {
            const param = match.split('.')[2];
            parameters.push({
              name: param,
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            });
          });
        }
      }
    } else {
      logger.log(`Controller not found: ${controllerPath}`); // Debugging line
    }

    if (!apiDocs.paths[routePath]) {
      apiDocs.paths[routePath] = {};
    }

    apiDocs.paths[routePath][method] = {
      summary: `API for ${method.toUpperCase()} ${routePath}`,
      requestBody,
      parameters,
      responses,
    };
  }

  fs.writeFileSync(
    path.join(__dirname, '../docs/swagger.json'),
    JSON.stringify(apiDocs, null, 2),
    { encoding: 'utf8', flag: 'w', mode: 0o666 },
  );
  logger.log('Swagger documentation generated!');
}

generateSwaggerDocs();
