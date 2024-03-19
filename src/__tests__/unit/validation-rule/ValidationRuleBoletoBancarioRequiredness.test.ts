import type { PaymentProductJSON } from '../../../types';
import type { CreateValidationTestData } from '../helper';

import { createValidationRuleTest } from '../helper';
import { ValidationRuleBoletoBancarioRequiredness } from '../../../validation-rule';

import { paymentProductJson as _paymentProductJson } from '../../__fixtures__/payment-product-json';
import {
  paymentProductFieldFiscalNumberJson as fiscalNumberFieldJson,
  paymentProductFieldDummyJson as dummyFieldJson,
} from '../../__fixtures__/payment-product-field-json';

const rule = new ValidationRuleBoletoBancarioRequiredness({
  type: 'boletoBancarioRequiredness',
  attributes: { fiscalNumberLength: 3 },
});

const paymentProductJson: PaymentProductJSON = {
  ..._paymentProductJson,
  fields: [dummyFieldJson, fiscalNumberFieldJson],
};

const data: CreateValidationTestData<typeof rule>[] = [
  {
    msg: 'Correct FiscalNumber Length: should fail validation when `setValue` when value is missing',
    setValue: [{ key: fiscalNumberFieldJson.id, value: '123' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
  },
  {
    msg: 'Correct FiscalNumber Length: should fail validation when value is an empty string',
    setValue: [
      { key: dummyFieldJson.id, value: '' },
      { key: fiscalNumberFieldJson.id, value: '123' },
    ],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: false }],
    validate: { args: ['', '123'], expected: false },
  },
  {
    msg: 'Correct FiscalNumber Length: should pass validation when fiscalNumber is found with a truthy value',
    setValue: [
      { key: dummyFieldJson.id, value: 'value' },
      { key: fiscalNumberFieldJson.id, value: '123' },
    ],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['value', '123'], expected: true },
  },
  {
    msg: 'Incorrect FiscalNumber Length: should pass validation when value is missing',
    setValue: [{ key: fiscalNumberFieldJson.id, value: '1' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
  },
  {
    msg: 'Incorrect FiscalNumber Length: should return pass validation when fiscal number length is not met the condition and value is truthy',
    setValue: [
      { key: dummyFieldJson.id, value: 'value' },
      { key: fiscalNumberFieldJson.id, value: '1' },
    ],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['value', '1'], expected: true },
  },
  {
    msg: 'Without FiscalNumber: should pass validation when fiscal number and value are not set',
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
  },
  {
    msg: 'Without FiscalNumber: should pass validation when fiscal number is not set and value is an empty string',
    setValue: [{ key: dummyFieldJson.id, value: '' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: [''], expected: true },
  },
  {
    msg: 'Without FiscalNumber: should pass validation when fiscal number is not set and value is truthy',
    setValue: [{ key: dummyFieldJson.id, value: 'value' }],
    validateValue: [{ fieldId: dummyFieldJson.id, expected: true }],
    validate: { args: ['value'], expected: true },
  },
];

createValidationRuleTest({ rule, paymentProductJson, data });
