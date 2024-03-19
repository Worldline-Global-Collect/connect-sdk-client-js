import { describe, expect, it } from 'vitest';

import { BasicPaymentItems } from '../../BasicPaymentItems';
import { BasicPaymentProductGroups } from '../../BasicPaymentProductGroups';
import { BasicPaymentProducts } from '../../BasicPaymentProducts';

import { basePaymentProductJson } from '../__fixtures__/base-payment-product-json';
import { basePaymentProductGroupJson } from '../__fixtures__/base-payment-product-group-json';
import { baseAccountOnFileJson } from '../__fixtures__/base-account-on-file-json';
import { AccountOnFile } from '../../AccountOnFile';
import { BasicPaymentProduct } from '../../BasicPaymentProduct';
import { BasicPaymentProductGroup } from '../../BasicPaymentProductGroup';

const paymentProducts = [
  {
    ...basePaymentProductJson,
    id: 1,
    paymentMethod: 'card',
    paymentProductGroup: 'cards',
    accountsOnFile: [{ ...baseAccountOnFileJson, id: 1, paymentProductId: 1 }],
  },
  { ...basePaymentProductJson, id: 302, paymentMethod: 'mobile' },
  { ...basePaymentProductJson, id: 809, paymentMethod: 'redirect' },
  {
    ...basePaymentProductJson,
    id: 2,
    paymentMethod: 'card',
    paymentProductGroup: 'cards',
    accountsOnFile: [{ ...baseAccountOnFileJson, id: 2, paymentProductId: 2 }],
  },
  {
    ...basePaymentProductJson,
    id: 840,
    paymentMethod: 'redirect',
    accountsOnFile: [
      { ...baseAccountOnFileJson, id: 3, paymentProductId: 840 },
    ],
  },
];

const paymentProductGroups = [
  {
    ...basePaymentProductGroupJson,
    id: 'cards',
    accountsOnFile: [
      { ...baseAccountOnFileJson, id: 1, paymentProductId: 1 },
      { ...baseAccountOnFileJson, id: 2, paymentProductId: 2 },
    ],
  },
];

const products = new BasicPaymentProducts({ paymentProducts });
const groups = new BasicPaymentProductGroups({ paymentProductGroups });

describe('without groups', () => {
  const items = new BasicPaymentItems(products);

  it('`basicPaymentItems` should contain all products', () => {
    const basicPaymentItemIds = items.basicPaymentItems
      .map((item) => item.id)
      .sort();
    expect(basicPaymentItemIds).toEqual(
      paymentProducts.map((p) => p.id).sort(),
    );
  });

  it.each(paymentProducts)(
    '`getBasicPaymentItem($id)` should contain corresponding BasicPaymentProduct with correct index',
    (paymentProduct) => {
      const index = paymentProducts.indexOf(paymentProduct);
      expect(items.getBasicPaymentItem(paymentProduct.id)).toBe(
        items.basicPaymentItems[index],
      );
    },
  );

  it('should have correct `accountsOnFile`', () => {
    const expectedPaymentProductIds = [1, 2, 840];
    expect(
      items.accountsOnFile.map((aof) => aof.paymentProductId).sort(),
    ).toEqual(expectedPaymentProductIds);
  });

  it('should get account on file by id using `getAccountOnFile`', () => {
    const ids = [1, 2, 3];
    ids.forEach((id) => {
      const aof = items.getAccountOnFile(id);
      expect(aof).toBeInstanceOf(AccountOnFile);
      expect(aof?.id).toBe(id);
    });
  });
});

describe('with groups', () => {
  const items = new BasicPaymentItems(products, groups);
  const basicPaymentItemsIds = ['cards', 302, 809, 840];

  it('should have correct `basicPaymentItems`', () => {
    expect(items.basicPaymentItems).toHaveLength(basicPaymentItemsIds.length);
    expect(items.basicPaymentItems.map((item) => item.id)).toEqual(
      basicPaymentItemsIds,
    );
  });

  it('should get basic payment item by given id using `getBasicPaymentItem`', () => {
    basicPaymentItemsIds.forEach((id, i) => {
      const basicPaymentItem = items.getBasicPaymentItem(id);
      expect([BasicPaymentProduct, BasicPaymentProductGroup]).toContain(
        basicPaymentItem?.constructor,
      );
      expect(basicPaymentItem?.id).toBe(id);
      expect(basicPaymentItem).toBe(items.basicPaymentItems[i]);
    });
  });

  it('should have correct `accountOnFile`', () => {
    const accountOnFileIds = [1, 2, 3];
    const paymentProductIds = [1, 2, 840];
    expect(items.accountsOnFile).toHaveLength(accountOnFileIds.length);
    expect(
      items.accountsOnFile.map(({ paymentProductId }) => paymentProductId),
    ).toEqual(paymentProductIds);
  });

  it('should get account on file by given id using `getAccountOnFile`', () => {
    items.accountsOnFile.forEach((accountOnFile) => {
      expect(items.getAccountOnFile(accountOnFile.id)).toBe(accountOnFile);
    });
  });
});
