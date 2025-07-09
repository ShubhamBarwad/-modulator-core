"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
/**
 * Dependency Injection Container supporting class and factory registrations.
 */
class Container {
    constructor() {
        this.registrations = new Map();
    }
    /**
     * Register a class or factory for a given key.
     * @param key - The DI key.
     * @param target - The class constructor or factory function.
     * @param options - Registration options (singleton by default).
     */
    register(key, target, options = {}) {
        var _a;
        // Heuristic: if target.prototype and target.prototype.constructor exist, it's a class; otherwise, it's a factory
        const isFactory = !(target.prototype && target.prototype.constructor && target.prototype.constructor.length >= 0);
        this.registrations.set(key, {
            target,
            singleton: (_a = options.singleton) !== null && _a !== void 0 ? _a : true,
            isFactory,
        });
    }
    /**
     * Resolve an instance for a given key.
     * @param key - The DI key.
     * @returns The resolved instance.
     */
    resolve(key) {
        const registration = this.registrations.get(key);
        if (!registration) {
            throw new Error(`No registration for key: ${key}`);
        }
        if (registration.singleton) {
            if (!registration.instance) {
                registration.instance = registration.isFactory
                    ? registration.target()
                    : new registration.target();
            }
            return registration.instance;
        }
        else {
            return registration.isFactory
                ? registration.target()
                : new registration.target();
        }
    }
}
exports.Container = Container;
exports.container = new Container();
