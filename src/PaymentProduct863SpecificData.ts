import type { PaymentProduct863SpecificDataJSON } from './types';

export class PaymentProduct863SpecificData {
  readonly integrationTypes: string[];

  constructor(readonly json: PaymentProduct863SpecificDataJSON) {
    this.integrationTypes = json.integrationTypes;
  }
}
