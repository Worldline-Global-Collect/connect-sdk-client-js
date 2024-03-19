import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleExpirationDate } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

function getFormattedDate(date: Date, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', opts).format(date).replace('/', '');
}

const validExpireDate4Digits = getFormattedDate(new Date(), {
  month: '2-digit',
  year: '2-digit',
});

const validExpireDate6Digits = getFormattedDate(new Date(), {
  month: '2-digit',
  year: 'numeric',
});

const rule = new ValidationRuleExpirationDate({
  type: 'expirationDate',
  attributes: {},
});

const paymentProductJson: PaymentProductJSON = {
  ..._paymentProductJson,
  fields: [dummyFieldJson],
};

const data: CreateValidationTestData<typeof rule>[] = [
  {
    msg: 'should fail validation when value is missing',
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
  },
  {
    msg: 'should fail validation when value is an empty string',
    setValue: [{ key: dummyFieldJson.id, value: '' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: [''], expected: false },
  },
  {
    msg: 'should pass validation with an expire date of 4 digits (MMYY) for current date',
    setValue: [{ key: dummyFieldJson.id, value: validExpireDate4Digits }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: [validExpireDate4Digits], expected: true },
  },
  {
    msg: 'should pass validation with an expire date of 6 digits (MMYYYY) for current date',
    setValue: [{ key: dummyFieldJson.id, value: validExpireDate6Digits }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: [validExpireDate6Digits], expected: true },
  },
  {
    msg: 'should fail validation with an expire date set in the past',
    setValue: [{ key: dummyFieldJson.id, value: '0122' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['0122'], expected: false },
  },
  {
    msg: 'should fail validation with an invalid date format',
    setValue: [{ key: dummyFieldJson.id, value: '12345' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['12345'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
