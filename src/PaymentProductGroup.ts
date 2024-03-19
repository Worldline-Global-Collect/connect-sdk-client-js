import type { PaymentProductGroupJSON } from './types';

import { BasicPaymentProductGroup } from './BasicPaymentProductGroup';
import { PaymentProductField } from './PaymentProductField';

export class PaymentProductGroup extends BasicPaymentProductGroup {
  readonly paymentProductFields: PaymentProductField[];
  private readonly _paymentProductFieldMap: Map<
    PaymentProductField['id'],
    PaymentProductField
  >;

  constructor(readonly json: PaymentProductGroupJSON) {
    super(json);
    this._paymentProductFieldMap = new Map(
      json.fields.map((field) => {
        const paymentProductField = new PaymentProductField(field);
        return [paymentProductField.id, paymentProductField];
      }),
    );
    this.paymentProductFields = Array.from(
      this._paymentProductFieldMap.values(),
    );
  }

  /**
   * Get the payment product field by given payment product field id.
   * @param paymentProductFieldId - The payment product field id
   */
  getPaymentProductField(
    paymentProductFieldId: PaymentProductField['id'],
  ): PaymentProductField | undefined {
    return this._paymentProductFieldMap.get(paymentProductFieldId);
  }
}
