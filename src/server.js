import HyperExpress from 'hyper-express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import initializeWaterline from './models/index.js';
import logger from './config/log4js.js';
import os from 'os';
import authMiddleware from './middlewares/auth.middleware.js';
import apiLimiter from './middlewares/rate-limiter.middleware.js';
import bodyParserMiddleware from './middlewares/body-parser.middleware.js';
import logMiddleware from './middlewares/log.middleware.js';

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

const protectedRoutes = [
  '/v0.5/auth/reset-password',
  '/v0.5/auth/send-verification-email',
  '/v0.5/auth/verify-email',
];

async function loadRoutes(directory, baseRoute = '') {
  const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of filesAndFolders) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      // Skip the 'skipFolderName' directory under 'modules/v0.5'
      if (entry.name === 'helper' && baseRoute === '/v0.5') {
        continue;
      }

      let updatedBaseRoute = baseRoute + '/' + entry.name;
      await loadRoutes(fullPath, updatedBaseRoute);
    } else {
      const handler = (await import(pathToFileURL(fullPath).href)).default;
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

      if (typeof webserver[method] === 'function') {
        if (baseRoute.includes(':id?')) {
          // Create both routes for folders named ':id?'
          const baseRouteWithoutId = baseRoute.replace('/:id?', '');
          if (protectedRoutes.includes(routePath)) {
            webserver[method](
              baseRouteWithoutId,
              authMiddleware,
              apiLimiter,
              handler,
            );
            webserver[method](routePath, authMiddleware, apiLimiter, handler);
          } else {
            webserver[method](baseRouteWithoutId, apiLimiter, handler);
            webserver[method](routePath, apiLimiter, handler);
          }
          logger.info(
            `Loaded: [${method.toUpperCase()}] ${baseRouteWithoutId}`,
          );
          logger.info(`Loaded: [${method.toUpperCase()}] ${routePath}`);
        } else {
          // Create the route normally
          if (protectedRoutes.includes(routePath)) {
            webserver[method](routePath, authMiddleware, apiLimiter, handler);
          } else {
            webserver[method](routePath, apiLimiter, handler);
          }
          logger.info(`Loaded: [${method.toUpperCase()}] ${routePath}`);
        }
      } else {
        logger.error(`Method ${method} is not supported by HyperExpress`);
      }
    }
  }
}

async function startServer() {
  try {
    await initializeWaterline();

    // Use the logging middleware
    webserver.use(bodyParserMiddleware);

    // Use the logging middleware
    webserver.use(logMiddleware);

    await loadRoutes(path.join(__dirname, 'modules'));
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

// This route returns the current version of the application.
// Useful for checking the deployed version.
webserver.get('/poll', (req, res) => {
  res.json({ version: packageJson.version });
});

// This route returns detailed health status of the server.
// Includes uptime, memory usage, CPU usage, and more.
webserver.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    loadAverage: os.loadavg(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
    networkInterfaces: os.networkInterfaces(),
  };
  res.json(healthStatus);
});

// Start the server
startServer();
