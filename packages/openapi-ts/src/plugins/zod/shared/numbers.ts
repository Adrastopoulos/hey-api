import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { isBigIntEnabled, maybeBigInt, shouldCoerceToBigInt } from '../../shared/utils/coerce';
import { getIntegerLimit, getSafeIntegerLimit } from '../../shared/utils/formats';
import type { NumberResolverContext } from '../resolvers';
import type { ZodPlugin } from '../types';

/**
 * Returns the number utilities for the plugin. 64-bit integers are `bigint`
 * values only when `@hey-api/transformers` has `bigInt` enabled. Otherwise
 * they are `number`s in the safe integer range, as `@hey-api/typescript`
 * types them.
 */
export function numberUtils(plugin: ZodPlugin['Instance']): NumberResolverContext['utils'] {
  if (isBigIntEnabled(plugin)) {
    return { getIntegerLimit, maybeBigInt, shouldCoerceToBigInt };
  }
  return {
    getIntegerLimit: getSafeIntegerLimit,
    maybeBigInt: (value) => $.fromValue(value),
    shouldCoerceToBigInt: () => false,
  };
}

const boundKeys = ['exclusiveMaximum', 'exclusiveMinimum', 'maximum', 'minimum'] as const;

/**
 * Returns the schema without the bounds of a 64-bit integer that a `number`
 * cannot hold, so the safe integer limits apply instead.
 */
export function withSafeBounds<T extends SchemaWithType<'integer' | 'number'>>(
  plugin: ZodPlugin['Instance'],
  schema: T,
): T {
  if (isBigIntEnabled(plugin) || !shouldCoerceToBigInt(schema.format)) {
    return schema;
  }
  const safeSchema = { ...schema };
  for (const key of boundKeys) {
    const value = safeSchema[key];
    if (typeof value === 'number' && Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      delete safeSchema[key];
    }
  }
  return safeSchema;
}
