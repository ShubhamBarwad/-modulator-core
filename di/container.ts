type Constructor<T = any> = new (...args: any[]) => T;

interface RegistrationOptions {
    singleton?: boolean;
}

interface Registration<T = any> {
    constructor: Constructor<T>;
    instance?: T;
    singleton: boolean;
}

export class Container {
    private registrations = new Map<string, Registration>();

    register<T>(key: string, constructor: Constructor<T>, options: RegistrationOptions = {}) {
        this.registrations.set(key, {
            constructor,
            singleton: options.singleton ?? true
        })
    }

    resolve<T>(key:string): T {
        const registration = this.registrations.get(key);
        if (!registration) {
            throw new Error(`No registraion for key: ${key}`);
        }

        if (registration.singleton) {
            if (!registration.instance) {
                registration.instance = new registration.constructor();
            }
            return registration.instance as T;
        } else {
            return new registration.constructor();
        }
    }
}

export const container = new Container();