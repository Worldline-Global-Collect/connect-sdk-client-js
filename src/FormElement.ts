import type { PaymentProductFieldFormElementJSON } from './types';

import { ValueMappingElement } from './ValueMappingElement';

export class FormElement {
  readonly type: string;
  readonly valueMapping: ValueMappingElement[];

  constructor(readonly json: PaymentProductFieldFormElementJSON) {
    this.type = json.type;
    this.valueMapping = (json.valueMapping || []).map(
      (mapping) => new ValueMappingElement(mapping),
    );
  }
}
