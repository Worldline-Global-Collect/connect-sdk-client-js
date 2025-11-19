import type { IinDetailsStatus, GetIINDetailsResponseJSON } from '../types';
import { captureStackTrace } from '../utils/captureStackTrace';

type IinDetailsResponseErrorStatus = Extract<
  IinDetailsStatus,
  'UNKNOWN' | 'NOT_ENOUGH_DIGITS'
>;

export class IinDetailsResponseError extends Error {
  constructor(
    readonly status: IinDetailsResponseErrorStatus,
    readonly json?: GetIINDetailsResponseJSON,
  ) {
    super(status);
    captureStackTrace(this, IinDetailsResponseError);
  }
}
