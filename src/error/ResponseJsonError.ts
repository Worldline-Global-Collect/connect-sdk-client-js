import type { APIErrorJSON, ErrorResponseJSON } from '../types';
import type { Merge, RequiredBy } from '../types/common';

type Error = RequiredBy<
  Partial<APIErrorJSON>,
  'code' | 'propertyName' | 'message' | 'httpStatusCode'
>;

type PartialErrorResponseJSON = Merge<ErrorResponseJSON, { errors: Error[] }>;

export class ResponseJsonError extends Error {
  public readonly errorId: string;
  public readonly errors: Error[];

  constructor(
    readonly message: string,
    { errorId, errors }: PartialErrorResponseJSON,
  ) {
    super(message);
    this.errorId = errorId;
    this.errors = errors;
  }
}
