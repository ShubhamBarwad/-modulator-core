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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnabledModules = loadEnabledModules;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Loads enabled modules based on config/modules.json
function loadEnabledModules() {
    const configPath = path.join(__dirname, '../../config/modules.json');
    const modulesDir = path.join(__dirname, '../../modules');
    if (!fs.existsSync(configPath)) {
        throw new Error('modules.json config not found');
    }
    // Read current enabled modules config
    let enabledModules = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const previousModulesJson = JSON.stringify(enabledModules, null, 2); // Save previous state
    let updated = false;
    // Scan modules directory for all valid modules
    const moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    // Map to keep track of module name to folder
    const nameToFolder = {};
    const foundModuleNames = new Set();
    for (const folderName of moduleFolders) {
        const manifestPath = path.join(modulesDir, folderName, 'module.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const moduleName = manifest.name;
            nameToFolder[moduleName] = folderName;
            foundModuleNames.add(moduleName);
            if (!(moduleName in enabledModules)) {
                enabledModules[moduleName] = true; // auto-register as enabled
                updated = true;
            }
        }
    }
    // Remove any modules from enabledModules that are not present in foundModuleNames
    for (const key of Object.keys(enabledModules)) {
        if (!foundModuleNames.has(key)) {
            delete enabledModules[key];
            updated = true;
        }
    }
    // If new modules were found or stale ones removed, update modules.json
    if (updated) {
        fs.writeFileSync(configPath, JSON.stringify(enabledModules, null, 2), { encoding: 'utf8' });
    }
    const loadedModules = [];
    try {
        for (const [moduleName, isEnabled] of Object.entries(enabledModules)) {
            if (!isEnabled)
                continue;
            const folderName = nameToFolder[moduleName];
            if (!folderName) {
                console.warn(`No folder found for enabled module: ${moduleName}`);
                continue;
            }
            const modulePath = path.join(modulesDir, folderName);
            const manifestPath = path.join(modulePath, 'module.json');
            if (!fs.existsSync(manifestPath)) {
                console.warn(`Manifest not found for module: ${moduleName}`);
                continue;
            }
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            // Validate dependencies
            if (manifest.dependencies) {
                for (const dep of manifest.dependencies) {
                    if (!(dep in enabledModules)) {
                        // Revert modules.json to previous state
                        fs.writeFileSync(configPath, previousModulesJson, { encoding: 'utf8' });
                        throw new Error(`Dependency '${dep}' for module '${moduleName}' is missing in modules.json. Aborting and reverting modules.json.`);
                    }
                }
            }
            // Validate migrations
            if (manifest.migrations) {
                for (const migration of manifest.migrations) {
                    const migrationPath = path.join(modulePath, migration);
                    if (!fs.existsSync(migrationPath)) {
                        console.warn(`Migration file '${migration}' for module '${moduleName}' is missing.`);
                    }
                }
            }
            loadedModules.push({ name: moduleName, manifest, modulePath });
        }
    }
    catch (err) {
        throw err;
    }
    return loadedModules;
}
