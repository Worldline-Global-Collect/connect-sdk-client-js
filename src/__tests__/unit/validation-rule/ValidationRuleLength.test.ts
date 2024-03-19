import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleLength } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldDummyJson as dummyFieldJson } from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleLength({
  type: 'length',
  attributes: { minLength: 2, maxLength: 5 },
});

const paymentProductJson: PaymentProductJSON = {
  ..._paymentProductJson,
  fields: [dummyFieldJson],
};

const data: CreateValidationTestData<typeof rule>[] = [
  {
    msg: 'should fail validation when no value is missing',
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
  },
  {
    msg: 'should fail validation when value is empty',
    setValue: [{ key: dummyFieldJson.id, value: '' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: [''], expected: false },
  },
  {
    msg: 'should pass validation when value is at minLength',
    setValue: [{ key: dummyFieldJson.id, value: '12' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['12'], expected: true },
  },
  {
    msg: 'should pass validation when value is at maxLength',
    setValue: [{ key: dummyFieldJson.id, value: '12345' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['12345'], expected: true },
  },
  {
    msg: 'should fail validation when value is below minLength',
    setValue: [{ key: dummyFieldJson.id, value: '1' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['1'], expected: false },
  },
  {
    msg: 'should fail validation when value is above maxLength',
    setValue: [{ key: dummyFieldJson.id, value: '123456' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['123456'], expected: false },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
