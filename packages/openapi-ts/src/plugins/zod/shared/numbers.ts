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
