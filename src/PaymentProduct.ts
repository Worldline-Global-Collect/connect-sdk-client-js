import type { PaymentProductJSON } from './types';

import { PaymentProductField } from './PaymentProductField';
import { BasicPaymentProduct } from './BasicPaymentProduct';

export class PaymentProduct extends BasicPaymentProduct {
  readonly fieldsWarning?: string;
  readonly paymentProductFields: PaymentProductField[];
  private readonly _paymentProductFieldMap: Map<
    PaymentProductField['id'],
    PaymentProductField
  >;

  constructor(readonly json: PaymentProductJSON) {
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
    this.fieldsWarning = json.fieldsWarning;
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
