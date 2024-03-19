import type { LabelTemplateElementJSON } from '../../types';

import { expect, it } from 'vitest';
import { AccountOnFileDisplayHints } from '../../AccountOnFileDisplayHints';
import { LabelTemplateElement } from '../../LabelTemplateElement';

const labelTemplate: LabelTemplateElementJSON[] = [
  { attributeKey: 'cardNumber', mask: '****' },
  { attributeKey: 'cardHolderName', mask: '****' },
];

const accountOnFileDisplayHints = new AccountOnFileDisplayHints({
  logo: '',
  labelTemplate,
});

it('should parse to `labelTemplate`', () => {
  expect(accountOnFileDisplayHints.labelTemplate).toHaveLength(2);
  expect(accountOnFileDisplayHints.labelTemplate).toEqual(
    expect.arrayContaining([expect.any(LabelTemplateElement)]),
  );
});

it('should get `LabelTemplateElement` by given attribute key, using `getLabelTemplateElement`', () => {
  ['cardNumber', 'cardHolderName'].forEach((attributeKey) => {
    expect(
      accountOnFileDisplayHints.getLabelTemplateElement(attributeKey),
    ).toBeInstanceOf(LabelTemplateElement);
  });
});
