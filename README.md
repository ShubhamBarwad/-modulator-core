# Nodesmith Core

The `core` package provides foundational features for building modular, event-driven Node.js applications. It includes:

- **Dependency Injection (DI) Container**
- **Event Bus**
- **Module Loader**
- **Type Definitions for Modules**

---

## Installation

```sh
npm install @yourorg/core
```

---

## Features

### 1. Dependency Injection (DI) Container

A simple, class-based DI container for registering and resolving dependencies.

**Register a class:**
```typescript
import { container } from '@yourorg/core';

container.register('EmailService', EmailServiceClass, { singleton: true });
```

**Resolve a class:**
```typescript
const emailService = container.resolve<EmailService>('EmailService');
```

- Supports singleton and transient lifecycles.
- All dependencies are registered and resolved by string keys.

---

### 2. Event Bus

A lightweight event bus for decoupled communication between modules.

**Usage:**
```typescript
import { EventBus } from '@yourorg/core';

const eventBus = new EventBus();

// Listen for events
eventBus.on('user.created', (user) => {
  console.log('User created:', user);
});

// Emit events
eventBus.emit('user.created', { id: 1, name: 'Alice' });
```

- Register and remove event handlers.
- Emit events with arbitrary payloads.

---

### 3. Module Loader

Automatically loads enabled modules based on your `config/modules.json` file.

**Usage:**
```typescript
import { loadEnabledModules } from '@yourorg/core';

const modules = loadEnabledModules();
```

- Scans the `modules/` directory for modules with a `module.json` manifest.
- Automatically enables new modules and removes stale ones.
- Validates module dependencies and migration files.

---

### 4. Type Definitions

TypeScript interfaces for module manifests and lifecycle hooks.

**Example:**
```typescript
import { ModuleManifest, LoadedModule, NodesmithModuleHooks } from '@yourorg/core';
```

- `ModuleManifest`: Describes a module’s metadata, dependencies, and assets.
- `LoadedModule`: Represents a loaded module with its manifest and path.
- `NodesmithModuleHooks`: Lifecycle hooks for modules (init, registerRoutes, registerModels, onShutdown).

---

## Example: Registering and Using the Event Bus via DI

```typescript
import { container, EventBus } from '@yourorg/core';

// Register EventBus as a singleton
container.register('EventBus', EventBus, { singleton: true });

// Resolve and use
const eventBus = container.resolve<EventBus>('EventBus');
eventBus.emit('app.started');
```

---

## Directory Structure

```
core/
  di/
    container.ts
  events/
    eventBus.ts
  loaders/
    moduleLoader.ts
  types/
    index.ts
  index.ts
  package.json
```

---

## Contributing

Feel free to open issues or PRs to improve the core features! 