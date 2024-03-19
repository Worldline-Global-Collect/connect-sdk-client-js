import type { AuthenticationIndicatorJSON } from './types';

export class AuthenticationIndicator {
  readonly name: string;
  readonly value: string;

  constructor(readonly json: AuthenticationIndicatorJSON) {
    this.name = json.name;
    this.value = json.value;
  }
}
