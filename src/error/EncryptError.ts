import type { ValidationError } from '../types';
import { captureStackTrace } from '../utils/captureStackTrace';

export class EncryptError extends Error {
  constructor(
    message: string,
    readonly validationErrors: ValidationError[] = [],
  ) {
    super(message);
    captureStackTrace(this, EncryptError);
  }
}
