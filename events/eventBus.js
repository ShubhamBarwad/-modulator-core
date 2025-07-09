"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
/**
 * A simple EventBus for registering event handlers and emitting events.
 * Allows modules to communicate via named events with arbitrary payloads.
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Registers an event handler for a specific event.
     * @param {string} event - The name of the event to listen for.
     * @param {EventHandler} handler - The function to call when the event is emitted.
     */
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
    }
    /**
     * Removes a previously registered event handler for a specific event.
     * @param {string} event - The name of the event.
     * @param {EventHandler} handler - The handler function to remove.
     */
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(event, handlers.filter(h => h !== handler));
        }
    }
    /**
     * Emits an event, calling all registered handlers with the provided arguments.
     * @param {string} event - The name of the event to emit.
     * @param {...any[]} args - Arguments to pass to the event handlers.
     */
    emit(event, ...args) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }
}
exports.EventBus = EventBus;
