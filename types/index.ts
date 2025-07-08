// Type for a module manifest
export interface ModuleManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  migrations?: string[];
  routes?: string[];
  models?: string[];
  entry?: string;
}

// Type for loaded module info
export interface LoadedModule {
  name: string;
  manifest: ModuleManifest;
  modulePath: string;
}

// Module hooks interface for all modules in the framework (no metadata)
export interface NodesmithModuleHooks {
  /**
   * Called when the module is loaded. Used for setup logic.
   * Receives the main app instance and module-specific config.
   */
  init?(app: any, config: any): Promise<void> | void;

  /**
   * Register HTTP routes/controllers for this module (optional)
   * Receives the main router instance.
   */
  registerRoutes?(router: any): void;

  /**
   * Register database models/schemas for this module (optional)
   * Receives the ORM or schema manager instance.
   */
  registerModels?(orm: any): void;

  /**
   * Called when the app (or module) is shutting down. Used for cleanup (optional)
   */
  onShutdown?(): Promise<void> | void;
} 