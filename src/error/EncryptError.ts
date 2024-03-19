import type { ValidationError } from '../types';

export class EncryptError extends Error {
  constructor(
    message: string,
    readonly validationErrors: ValidationError[] = [],
  ) {
    super(message);
  }
}
