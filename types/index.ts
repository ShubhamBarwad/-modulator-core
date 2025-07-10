// Type for a module manifest
export interface ModuleManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  migrations?: string[];
  models?: string[];
  // Note: routes are now auto-discovered and do not need to be listed here.
}

// Type for loaded module info
export interface LoadedModule {
  name: string;
  manifest: ModuleManifest;
  modulePath: string;
}

 