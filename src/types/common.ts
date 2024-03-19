/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Make properties defined as U required in T
 */
export type RequiredBy<T extends Record<string, any>, U extends keyof T> = Omit<
  T,
  U
> &
  Required<Pick<T, U>>;

/**
 * Make properties defined as U partial in T
 */
export type PartialBy<T extends Record<string, any>, U extends keyof T> = Omit<
  T,
  U
> &
  Partial<Pick<T, U>>;

/**
 * Merge U into T
 */
export type Merge<
  T extends Record<string, any>,
  U extends Record<string, any>,
> = Omit<T, keyof U> & U;
