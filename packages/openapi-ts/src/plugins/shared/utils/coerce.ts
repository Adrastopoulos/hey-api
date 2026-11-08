import type { PluginInstance } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';

export type MaybeBigInt = (
  value: unknown,
  format: string | undefined,
) => ReturnType<typeof $.fromValue>;
export type ShouldCoerceToBigInt = (format: string | undefined) => boolean;

export const shouldCoerceToBigInt: ShouldCoerceToBigInt = (format) =>
  format === 'int64' || format === 'uint64';

/**
 * Whether `@hey-api/transformers` converts `int64` integers to `bigint`
 * values. `@hey-api/typescript` types them as `bigint` only in that case.
 */
export const isBigIntEnabled = (plugin: Pick<PluginInstance, 'getPlugin'>): boolean =>
  Boolean(plugin.getPlugin('@hey-api/transformers')?.config.bigInt);

export const maybeBigInt: MaybeBigInt = (value, format) => {
  if (!shouldCoerceToBigInt(format)) {
    return $.fromValue(value);
  }

  if (typeof value === 'string') {
    // handle invalid input
    if (value.endsWith('n')) value = value.slice(0, -1);
    return $('BigInt').call($.fromValue(value));
  }

  if (typeof value === 'number') {
    return $('BigInt').call($.fromValue(value));
  }

  return $.fromValue(value);
};
