/**
 * Utilitaire de debug pour afficher toutes les routes de l'API
 * 
 * Pour utiliser ce script, importez-le dans votre app.ts ou server.ts
 * et appelez printApiRoutes(app) après avoir configuré toutes vos routes.
 */

import { Application } from 'express';

export const printApiRoutes = (app: Application) => {
  const routes: { method: string; path: string }[] = [];

  // Collecte toutes les routes enregistrées
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes directement enregistrées sur l'app
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter((method) => middleware.route.methods[method])
        .map((method) => method.toUpperCase());
      
      methods.forEach((method) => {
        routes.push({ method, path });
      });
    } else if (middleware.name === 'router') {
      // Routes montées via un router
      const baseRoute = middleware.regexp.toString()
        .replace('\\/?(?=\\/|$)', '')
        .replace(/^\/\^\\/, '')
        .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '')
        .replace(/\\\//g, '/');

      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = baseRoute + handler.route.path;
          const methods = Object.keys(handler.route.methods)
            .filter((method) => handler.route.methods[method])
            .map((method) => method.toUpperCase());
          
          methods.forEach((method) => {
            routes.push({ method, path });
          });
        }
      });
    }
  });

  // Affiche les routes de manière organisée
  console.log('\n=== ROUTES API DISPONIBLES ===\n');
  
  // Tri les routes par chemin
  routes.sort((a, b) => a.path.localeCompare(b.path));
  
  // Regroupe par chemin de base
  const groupedRoutes: Record<string, { method: string; path: string }[]> = {};
  
  routes.forEach((route) => {
    const basePath = route.path.split('/')[1] || 'root';
    if (!groupedRoutes[basePath]) {
      groupedRoutes[basePath] = [];
    }
    groupedRoutes[basePath].push(route);
  });
  
  // Affiche les routes par groupe
  Object.keys(groupedRoutes).sort().forEach((group) => {
    console.log(`\n--- ${group.toUpperCase()} ---`);
    groupedRoutes[group].forEach((route) => {
      console.log(`${route.method.padEnd(7)} ${route.path}`);
    });
  });
  
  console.log('\n=============================\n');
};
