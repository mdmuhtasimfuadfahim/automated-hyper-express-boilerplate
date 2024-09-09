import fs from 'fs';
import path from 'path';
import swaggerConfig from '../config/swagger-config.js';

function generateSwaggerDocs() {
    const apiDocs = { ...swaggerConfig };

    // Logic to auto-generate docs based on routes
    const routes = getRoutesFromDirectory('modules');
    routes.forEach(route => {
        apiDocs.paths[route.path] = {
            [route.method]: {
                summary: `API for ${route.method.toUpperCase()} ${route.path}`,
                responses: {
                    200: {
                        description: "Successful Response"
                    }
                }
            }
        };
    });

    fs.writeFileSync('docs/swagger.json', JSON.stringify(apiDocs, null, 2));
    console.log('Swagger documentation generated!');
}

generateSwaggerDocs();

function getRoutesFromDirectory(directory) {
    const routes = [];
    const filesAndFolders = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of filesAndFolders) {
        if (entry.isDirectory()) {
            routes.push(...getRoutesFromDirectory(path.join(directory, entry.name)));
        } else {
            const [routeName, method] = entry.name.split('.');
            const routePath = `/${directory.replace('modules/', '')}`;
            routes.push({ path: routePath, method });
        }
    }
    return routes;
}