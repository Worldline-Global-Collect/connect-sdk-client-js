import type { PaymentProduct320SpecificDataJSON } from './types';

export class PaymentProduct320SpecificData {
  readonly gateway: string;
  readonly networks: string[];

  constructor(readonly json: PaymentProduct320SpecificDataJSON) {
    this.gateway = json.gateway;
    this.networks = json.networks;
  }
}
