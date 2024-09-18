import HyperExpress from 'hyper-express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import initializeWaterline from './models/index.js';
import logger from './config/log4js.js';
import os from 'os';

const webserver = new HyperExpress.Server();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config();

const PORT = process.env.PORT || 4080;

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'docs', 'swagger.json'), 'utf8'),
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);

async function loadRoutes(directory, baseRoute = '') {
  const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of filesAndFolders) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      let updatedBaseRoute = baseRoute + '/' + entry.name;
      await loadRoutes(fullPath, updatedBaseRoute);
    } else {
      const handler = (await import(pathToFileURL(fullPath).href)).default;
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
      if (typeof webserver[method] === 'function') {
        webserver[method](routePath, handler);
        logger.info(`Loaded: [${method.toUpperCase()}] ${routePath}`);
      } else {
        logger.error(`Method ${method} is not supported by HyperExpress`);
      }
    }
  }
}

async function startServer() {
  try {
    await initializeWaterline();
    await webserver.listen(parseInt(PORT), () => {
      logger.info(`Server is listening on port ${PORT}`);
      logSystemInfo();
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
  }
}

function logSystemInfo() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem() / (1024 * 1024);
  const freeMemory = os.freemem() / (1024 * 1024);

  logger.info(`Total CPU cores: ${cpus.length}`);
  logger.info(
    `Speed: ${cpus[0].speed}; Times: ${JSON.stringify(cpus[0].times)}`,
  );
  logger.info(`Total free memory: ${freeMemory.toFixed(2)}MB`);
  logger.info(`Total available RAM: ${totalMemory.toFixed(2)}MB`);
}

webserver.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve the index.html file for the base URL '/'
webserver.get('/', (req, res) =>
  res.type('text/html').sendFile(path.join(__dirname, 'matrix', 'index.html')),
);

// Add the /poll route
webserver.get('/poll', (req, res) => {
  res.json({ version: packageJson.version });
});

// Load all routes from the 'modules' directory and start the server once the routes are loaded
loadRoutes(path.join(__dirname, 'modules')).then(() => startServer());
