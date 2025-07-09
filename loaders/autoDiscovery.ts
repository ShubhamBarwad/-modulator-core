import * as fs from 'fs';
import * as path from 'path';
import { LoadedModule } from '../types';

/**
 * Auto-discovery system that leverages the consistent folder structure
 * to automatically find and register components.
 */
export class AutoDiscovery {
  
  /**
   * Automatically discover and register events from all modules
   * Scans the events/ folder in each module for event handler files
   */
  static async discoverEvents(modules: LoadedModule[], eventBus: any): Promise<void> {
    for (const module of modules) {
      const eventsDir = path.join(module.modulePath, 'events');
      
      if (!fs.existsSync(eventsDir)) continue;
      
      // Find all event handler files (excluding README.md)
      const eventFiles = fs.readdirSync(eventsDir)
        .filter(file => file.endsWith('.ts') && file !== 'README.md');
      
      for (const eventFile of eventFiles) {
        try {
          const eventPath = path.join(eventsDir, eventFile);
          const eventHandler = require(eventPath);
          
          // Auto-register event handlers
          if (typeof eventHandler.register === 'function') {
            eventHandler.register(eventBus);
            console.log(`Auto-registered events from ${module.name}/${eventFile}`);
          } else if (typeof eventHandler.registerEvents === 'function') {
            // Support for the standard Events.ts pattern
            eventHandler.registerEvents(eventBus);
            console.log(`Auto-registered events from ${module.name}/${eventFile}`);
          }
        } catch (err) {
          console.warn(`Failed to load event handler ${eventFile} from ${module.name}:`, err);
        }
      }
    }
  }

  /**
   * Automatically discover and register routes from all modules
   * Scans the routes/ folder in each module for route files
   */
  static async discoverRoutes(modules: LoadedModule[], app: any): Promise<void> {
    for (const module of modules) {
      const routesDir = path.join(module.modulePath, 'routes');
      
      if (!fs.existsSync(routesDir)) continue;
      
      // Find all route files (excluding README.md)
      const routeFiles = fs.readdirSync(routesDir)
        .filter(file => file.endsWith('.ts') && file !== 'README.md');
      
      for (const routeFile of routeFiles) {
        try {
          const routePath = path.join(routesDir, routeFile);
          const routeHandler = require(routePath);
          
          // Auto-register route handlers
          if (typeof routeHandler.register === 'function') {
            routeHandler.register(app);
            console.log(`Auto-registered routes from ${module.name}/${routeFile}`);
          } else if (typeof routeHandler.registerRoutes === 'function') {
            // Support for the standard Routes.ts pattern
            routeHandler.registerRoutes(app);
            console.log(`Auto-registered routes from ${module.name}/${routeFile}`);
          } else if (routeHandler.default && typeof routeHandler.default === 'function') {
            // Handle default exports (Express routers)
            app.use(`/${module.name}`, routeHandler.default);
            console.log(`Auto-registered router from ${module.name}/${routeFile}`);
          }
        } catch (err) {
          console.warn(`Failed to load route handler ${routeFile} from ${module.name}:`, err);
        }
      }
    }
  }

  /**
   * Automatically discover and register services from all modules
   * Scans the services/ folder and registers them in the DI container
   */
  static async discoverServices(modules: LoadedModule[], container: any): Promise<void> {
    for (const module of modules) {
      const servicesDir = path.join(module.modulePath, 'services');
      
      if (!fs.existsSync(servicesDir)) continue;
      
      const serviceFiles = fs.readdirSync(servicesDir)
        .filter(file => file.endsWith('.ts') && file !== 'README.md');
      
      for (const serviceFile of serviceFiles) {
        try {
          const servicePath = path.join(servicesDir, serviceFile);
          const serviceModule = require(servicePath);
          
          // Register services in DI container
          for (const [key, value] of Object.entries(serviceModule)) {
            if (typeof value === 'function' && key.endsWith('Service')) {
              const serviceName = `${module.name}.${key}`;
              container.register(serviceName, value, { singleton: true });
              console.log(`Auto-registered service: ${serviceName}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to load service ${serviceFile} from ${module.name}:`, err);
        }
      }
    }
  }

  /**
   * Automatically discover and register middleware from all modules
   * Scans the middleware/ folder and makes them available
   */
  static async discoverMiddleware(modules: LoadedModule[]): Promise<Map<string, any>> {
    const middlewareMap = new Map<string, any>();
    
    for (const module of modules) {
      const middlewareDir = path.join(module.modulePath, 'middleware');
      
      if (!fs.existsSync(middlewareDir)) continue;
      
      const middlewareFiles = fs.readdirSync(middlewareDir)
        .filter(file => file.endsWith('.ts') && file !== 'README.md');
      
      for (const middlewareFile of middlewareFiles) {
        try {
          const middlewarePath = path.join(middlewareDir, middlewareFile);
          const middlewareModule = require(middlewarePath);
          
          // Collect middleware functions
          for (const [key, value] of Object.entries(middlewareModule)) {
            if (typeof value === 'function') {
              const middlewareName = `${module.name}.${key}`;
              middlewareMap.set(middlewareName, value);
              console.log(`Discovered middleware: ${middlewareName}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to load middleware ${middlewareFile} from ${module.name}:`, err);
        }
      }
    }
    
    return middlewareMap;
  }

  /**
   * Automatically discover and load types from all modules
   * Scans the types/ folder and makes them available globally
   */
  static async discoverTypes(modules: LoadedModule[]): Promise<Map<string, any>> {
    const typesMap = new Map<string, any>();
    
    for (const module of modules) {
      const typesDir = path.join(module.modulePath, 'types');
      
      if (!fs.existsSync(typesDir)) continue;
      
      const typeFiles = fs.readdirSync(typesDir)
        .filter(file => file.endsWith('.ts') && file !== 'README.md');
      
      for (const typeFile of typeFiles) {
        try {
          const typePath = path.join(typesDir, typeFile);
          const typeModule = require(typePath);
          
          // Collect type definitions
          for (const [key, value] of Object.entries(typeModule)) {
            const typeName = `${module.name}.${key}`;
            typesMap.set(typeName, value);
            console.log(`Discovered type: ${typeName}`);
          }
        } catch (err) {
          console.warn(`Failed to load types ${typeFile} from ${module.name}:`, err);
        }
      }
    }
    
    return typesMap;
  }

  /**
   * Comprehensive auto-discovery that finds all components
   */
  static async discoverAll(modules: LoadedModule[], app: any, eventBus: any, container: any): Promise<{
    middleware: Map<string, any>;
    types: Map<string, any>;
  }> {
    console.log('Starting auto-discovery...');
    
    // Discover all components in parallel
    const [middleware, types] = await Promise.all([
      this.discoverMiddleware(modules),
      this.discoverTypes(modules)
    ]);
    
    // Register events, routes, and services
    await Promise.all([
      this.discoverEvents(modules, eventBus),
      this.discoverRoutes(modules, app),
      this.discoverServices(modules, container)
    ]);
    
    console.log(`Auto-discovery complete: ${middleware.size} middleware, ${types.size} types`);
    
    return { middleware, types };
  }
} 