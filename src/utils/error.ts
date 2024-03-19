/**
 * Get the error message from the object which type is unknown.
 * Useful within try/catch statements.
 *
 * @param error - The error object
 * @example
 */
export function getErrorMessage(error: Error): string;
export function getErrorMessage(error: string): string;
export function getErrorMessage(error: unknown): undefined;
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return undefined;
}
