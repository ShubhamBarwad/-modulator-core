import { container } from './di/container';
import { EventBus } from './events/eventBus';

export * from './loaders/moduleLoader';
export * from './types';
export { container } from './di/container';
export { EventBus } from './events/eventBus';

/**
 * Returns the singleton EventBus instance from the DI container.
 */
export function getEventBus() {
    return container.resolve<EventBus>('EventBus');
}