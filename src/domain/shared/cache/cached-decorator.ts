import { cacheService } from './cache-service';

export function cached(
  cacheKey: string,
  identityFn: (this: any, ...args: any[]) => string
) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = function (...args: any[]) {
      const identity = identityFn.call(this, ...args);
      const fullKey = `${cacheKey}:${identity}`;

      const cached = cacheService.get(fullKey);
      if (cached !== undefined) {
        return cached;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((value: unknown) => {
          cacheService.set(fullKey, value);
          return value;
        });
      }

      cacheService.set(fullKey, result);
      return result;
    };

    return descriptor;
  };
}
