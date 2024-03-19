import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentRequest } from '../../PaymentRequest';
import { PaymentProduct } from '../../PaymentProduct';
import { AccountOnFile } from '../../AccountOnFile';

import { paymentProductJson } from '../__fixtures__/payment-product-json';
import { paymentProductFieldCardNumberJson as cardFieldJson } from '../__fixtures__/payment-product-field-json';
import { baseAccountOnFileJson } from '../__fixtures__/base-account-on-file-json';

const fieldRequiredLuhn = {
  ...cardFieldJson,
  dataRestrictions: { isRequired: true, validators: { luhn: {} } },
};

describe('validate', () => {
  let request: PaymentRequest;
  beforeEach(() => {
    request = new PaymentRequest('sessionId');
  });

  it('should throw an error when `paymentProduct` is not set', () => {
    expect(() => request.validate()).toThrow(
      new Error(
        'Error validating PaymentRequest, please set a paymentProduct first.',
      ),
    );
  });

  describe('with payment product', () => {
    it('should return no errors when `paymentProduct` does not have any fields to validate', () => {
      const _paymentProductJson = { ...paymentProductJson, fields: [] };
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      const errors = request.validate();
      expect(errors).toStrictEqual([]);
    });

    it('should return an error when request contains a field who is required, but value is not set', () => {
      const _paymentProductJson = {
        ...paymentProductJson,
        fields: [fieldRequiredLuhn],
      };
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      expect(request.validate()).toStrictEqual([
        { fieldId: fieldRequiredLuhn.id, errorMessageId: 'required' },
      ]);
    });

    it('should return no errors when `paymentProduct` contains a field who is required, and value is set correctly', () => {
      const _paymentProductJson = {
        ...paymentProductJson,
        fields: [fieldRequiredLuhn],
      };
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      request.setValue(cardFieldJson.id, '4567350000427977');
      expect(request.validate()).toStrictEqual([]);
    });

    it('should return errors `paymentProduct` contains a field who is required, and value is set as empty string', () => {
      const _paymentProductJson = {
        ...paymentProductJson,
        fields: [fieldRequiredLuhn],
      };
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      request.setValue(cardFieldJson.id, '');
      expect(request.validate()).toStrictEqual([
        { fieldId: cardFieldJson.id, errorMessageId: 'luhn' },
        { fieldId: cardFieldJson.id, errorMessageId: 'required' },
      ]);
    });
  });

  describe('with field provided by account on file', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [cardFieldJson],
    };

    const aofReadOnly = new AccountOnFile({
      ...baseAccountOnFileJson,
      paymentProductId: _paymentProductJson.id,
      attributes: [
        {
          key: 'cardNumber',
          value: '************7977',
          status: 'READ_ONLY',
        },
      ],
    });

    const aofMustWrite = new AccountOnFile({
      ...baseAccountOnFileJson,
      paymentProductId: _paymentProductJson.id,
      attributes: [
        {
          key: 'cardNumber',
          value: '************7977',
          status: 'MUST_WRITE',
        },
      ],
    });

    it('should return no errors when account on file contains attribute status `READ_ONLY`', () => {
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      request.setAccountOnFile(aofReadOnly);
      expect(request.validate()).toStrictEqual([]);
    });

    it('should return errors when account on file contains attribute status `MUST_WRITE` without overridden value', () => {
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      request.setAccountOnFile(aofMustWrite);
      expect(request.validate()).toStrictEqual([
        { fieldId: 'cardNumber', errorMessageId: 'required' },
      ]);
    });

    it('should return no errors when account on file contains attribute status `MUST_WRITE` with overridden value', () => {
      request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
      request.setAccountOnFile(aofMustWrite);
      request.setValue('cardNumber', '4567350000427977');
      expect(request.validate()).toStrictEqual([]);
    });
  });
});
