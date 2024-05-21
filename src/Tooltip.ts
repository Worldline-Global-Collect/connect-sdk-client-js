import type { PaymentProductFieldTooltipJSON } from './types';

export class Tooltip {
  readonly image?: string;
  readonly label?: string;

  constructor(readonly json: PaymentProductFieldTooltipJSON) {
    this.image = json.image;
    this.label = json.label;
  }
}
