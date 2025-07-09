import * as fs from 'fs';
import * as path from 'path';
import { ModuleManifest, LoadedModule } from '../types';

// Loads enabled modules based on config/modules.json
export function loadEnabledModules(): LoadedModule[] {
  // Always resolve relative to the user's project root
  const configPath = path.join(process.cwd(), 'config', 'modules.json');
  const modulesDir = path.join(process.cwd(), 'modules');

  if (!fs.existsSync(configPath)) {
    throw new Error('modules.json config not found');
  }

  // Read current enabled modules config
  let enabledModules: Record<string, boolean> = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const previousModulesJson = JSON.stringify(enabledModules, null, 2); // Save previous state
  let updated = false;

  // Scan modules directory for all valid modules
  const moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Map to keep track of module name to folder
  const nameToFolder: Record<string, string> = {};
  const foundModuleNames: Set<string> = new Set();

  for (const folderName of moduleFolders) {
    const manifestPath = path.join(modulesDir, folderName, 'module.json');
    if (fs.existsSync(manifestPath)) {
      const manifest: ModuleManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
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

  const loadedModules: LoadedModule[] = [];
  try {
    for (const [moduleName, isEnabled] of Object.entries(enabledModules)) {
      if (!isEnabled) continue;
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
      const manifest: ModuleManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

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
  } catch (err) {
    throw err;
  }

  return loadedModules;
} 