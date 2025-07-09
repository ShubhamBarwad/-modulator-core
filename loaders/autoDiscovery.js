"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDiscovery = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Auto-discovery system that leverages the consistent folder structure
 * to automatically find and register components.
 */
class AutoDiscovery {
    /**
     * Automatically discover and register events from all modules
     * Scans the events/ folder in each module for event handler files
     */
    static discoverEvents(modules, eventBus) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const module of modules) {
                const eventsDir = path.join(module.modulePath, 'events');
                if (!fs.existsSync(eventsDir))
                    continue;
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
                        }
                        else if (typeof eventHandler.registerEvents === 'function') {
                            // Support for the standard Events.ts pattern
                            eventHandler.registerEvents(eventBus);
                            console.log(`Auto-registered events from ${module.name}/${eventFile}`);
                        }
                    }
                    catch (err) {
                        console.warn(`Failed to load event handler ${eventFile} from ${module.name}:`, err);
                    }
                }
            }
        });
    }
    /**
     * Automatically discover and register routes from all modules
     * Scans the routes/ folder in each module for route files
     */
    static discoverRoutes(modules, app) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const module of modules) {
                const routesDir = path.join(module.modulePath, 'routes');
                if (!fs.existsSync(routesDir))
                    continue;
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
                        }
                        else if (typeof routeHandler.registerRoutes === 'function') {
                            // Support for the standard Routes.ts pattern
                            routeHandler.registerRoutes(app);
                            console.log(`Auto-registered routes from ${module.name}/${routeFile}`);
                        }
                        else if (routeHandler.default && typeof routeHandler.default === 'function') {
                            // Handle default exports (Express routers)
                            app.use(`/${module.name}`, routeHandler.default);
                            console.log(`Auto-registered router from ${module.name}/${routeFile}`);
                        }
                    }
                    catch (err) {
                        console.warn(`Failed to load route handler ${routeFile} from ${module.name}:`, err);
                    }
                }
            }
        });
    }
    /**
     * Automatically discover and register services from all modules
     * Scans the services/ folder and registers them in the DI container
     */
    static discoverServices(modules, container) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const module of modules) {
                const servicesDir = path.join(module.modulePath, 'services');
                if (!fs.existsSync(servicesDir))
                    continue;
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
                    }
                    catch (err) {
                        console.warn(`Failed to load service ${serviceFile} from ${module.name}:`, err);
                    }
                }
            }
        });
    }
    /**
     * Automatically discover and register middleware from all modules
     * Scans the middleware/ folder and makes them available
     */
    static discoverMiddleware(modules) {
        return __awaiter(this, void 0, void 0, function* () {
            const middlewareMap = new Map();
            for (const module of modules) {
                const middlewareDir = path.join(module.modulePath, 'middleware');
                if (!fs.existsSync(middlewareDir))
                    continue;
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
                    }
                    catch (err) {
                        console.warn(`Failed to load middleware ${middlewareFile} from ${module.name}:`, err);
                    }
                }
            }
            return middlewareMap;
        });
    }
    /**
     * Automatically discover and load types from all modules
     * Scans the types/ folder and makes them available globally
     */
    static discoverTypes(modules) {
        return __awaiter(this, void 0, void 0, function* () {
            const typesMap = new Map();
            for (const module of modules) {
                const typesDir = path.join(module.modulePath, 'types');
                if (!fs.existsSync(typesDir))
                    continue;
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
                    }
                    catch (err) {
                        console.warn(`Failed to load types ${typeFile} from ${module.name}:`, err);
                    }
                }
            }
            return typesMap;
        });
    }
    /**
     * Comprehensive auto-discovery that finds all components
     */
    static discoverAll(modules, app, eventBus, container) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Starting auto-discovery...');
            // Discover all components in parallel
            const [middleware, types] = yield Promise.all([
                this.discoverMiddleware(modules),
                this.discoverTypes(modules)
            ]);
            // Register events, routes, and services
            yield Promise.all([
                this.discoverEvents(modules, eventBus),
                this.discoverRoutes(modules, app),
                this.discoverServices(modules, container)
            ]);
            console.log(`Auto-discovery complete: ${middleware.size} middleware, ${types.size} types`);
            return { middleware, types };
        });
    }
}
exports.AutoDiscovery = AutoDiscovery;
