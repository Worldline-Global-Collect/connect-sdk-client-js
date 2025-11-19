import type { SdkResponse } from '../types';
import { captureStackTrace } from '../utils/captureStackTrace';

export class ResponseError<Response extends SdkResponse> extends Error {
  readonly status: Response['status'];
  readonly success: Response['success'];
  readonly data: Response['data'];

  constructor(
    message: string,
    readonly response: Response,
  ) {
    super(message);
    this.status = response.status;
    this.success = response.success;
    this.data = response.data;
    captureStackTrace(this, ResponseError);
  }
}
