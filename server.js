import HyperExpress from 'hyper-express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' assert { type: 'json' };
import initializeWaterline from './models/index.js';

const webserver = new HyperExpress.Server();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config();

const PORT = process.env.PORT || 4080;

async function loadRoutes(directory, baseRoute = '') {
    const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of filesAndFolders) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            let updatedBaseRoute = baseRoute + '/' + entry.name;
            await loadRoutes(fullPath, updatedBaseRoute);
        } else {
            const handler = (await import(pathToFileURL(fullPath).href)).default;
            let [routeName, ...rest] = entry.name.split('.');
            let method;

            switch (routeName) {
                case 'get':
                    method = 'get';
                    break;
                case 'create':
                    method = 'post';
                    break;
                case 'update':
                    method = 'patch';
                    break;
                case 'delete':
                    method = 'delete';
                    break;
                default:
                    console.warn(`Unknown route name: ${routeName}`);
                    continue;
            }

            const routePath = `${baseRoute}`;
            webserver[method](routePath, handler);
            console.log(`Loaded: [${method.toUpperCase()}] ${routePath}`);
        }
    }
}

async function startServer() {
    try {
        await initializeWaterline();
        await webserver.listen(parseInt(PORT), () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
    }
}

webserver.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
loadRoutes(path.join(__dirname, 'modules')).then(() => startServer());