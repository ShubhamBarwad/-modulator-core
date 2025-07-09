"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
class Container {
    constructor() {
        this.registrations = new Map();
    }
    register(key, constructor, options = {}) {
        var _a;
        this.registrations.set(key, {
            constructor,
            singleton: (_a = options.singleton) !== null && _a !== void 0 ? _a : true
        });
    }
    resolve(key) {
        const registration = this.registrations.get(key);
        if (!registration) {
            throw new Error(`No registraion for key: ${key}`);
        }
        if (registration.singleton) {
            if (!registration.instance) {
                registration.instance = new registration.constructor();
            }
            return registration.instance;
        }
        else {
            return new registration.constructor();
        }
    }
}
exports.Container = Container;
exports.container = new Container();
