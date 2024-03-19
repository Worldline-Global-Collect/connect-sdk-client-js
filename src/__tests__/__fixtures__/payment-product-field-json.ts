import type { PaymentProductFieldJSON } from '../../types';

export const paymentProductFieldCardNumberJson: PaymentProductFieldJSON = {
  dataRestrictions: { isRequired: true, validators: { luhn: {} } },
  id: 'cardNumber',
  type: 'numericstring',
};

export const paymentProductFieldDummyJson: PaymentProductFieldJSON = {
  dataRestrictions: { isRequired: true, validators: {} },
  id: 'dummy',
  type: 'string',
};

export const paymentProductFieldFiscalNumberJson: PaymentProductFieldJSON = {
  id: 'fiscalNumber',
  type: 'string',
  dataRestrictions: { isRequired: false, validators: {} },
};
