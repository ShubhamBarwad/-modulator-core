/**
 * Type for a class constructor.
 */
type Constructor<T = any> = new (...args: any[]) => T;
/**
 * Type for a factory function that returns an instance.
 */
type Factory<T = any> = () => T;
/**
 * Registration target can be a class or a factory function.
 */
type RegistrationTarget<T = any> = Constructor<T> | Factory<T>;

interface RegistrationOptions {
    singleton?: boolean;
}

interface Registration<T = any> {
    target: RegistrationTarget<T>;
    instance?: T;
    singleton: boolean;
    isFactory: boolean;
}

/**
 * Dependency Injection Container supporting class and factory registrations.
 */
export class Container {
    private registrations = new Map<string, Registration>();

    /**
     * Register a class or factory for a given key.
     * @param key - The DI key.
     * @param target - The class constructor or factory function.
     * @param options - Registration options (singleton by default).
     */
    register<T>(key: string, target: RegistrationTarget<T>, options: RegistrationOptions = {}) {
        // Heuristic: if target.prototype and target.prototype.constructor exist, it's a class; otherwise, it's a factory
        const isFactory = !(target.prototype && target.prototype.constructor && target.prototype.constructor.length >= 0);
        this.registrations.set(key, {
            target,
            singleton: options.singleton ?? true,
            isFactory,
        });
    }

    /**
     * Resolve an instance for a given key.
     * @param key - The DI key.
     * @returns The resolved instance.
     */
    resolve<T>(key: string): T {
        const registration = this.registrations.get(key);
        if (!registration) {
            throw new Error(`No registration for key: ${key}`);
        }

        if (registration.singleton) {
            if (!registration.instance) {
                registration.instance = registration.isFactory
                    ? (registration.target as Factory<T>)()
                    : new (registration.target as Constructor<T>)();
            }
            return registration.instance as T;
        } else {
            return registration.isFactory
                ? (registration.target as Factory<T>)()
                : new (registration.target as Constructor<T>)();
        }
    }
}

export const container = new Container();