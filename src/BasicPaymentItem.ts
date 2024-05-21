import type { BasicPaymentProduct } from './BasicPaymentProduct';
import type { BasicPaymentProductGroup } from './BasicPaymentProductGroup';

export type BasicPaymentItem = BasicPaymentProduct | BasicPaymentProductGroup;

/**
 * Returns true if the item is a BasicPaymentProductGroup
 */
export function isBasicPaymentProductGroup(
  item: BasicPaymentItem,
): item is BasicPaymentProductGroup {
  return item.type === 'group';
}

/**
 * Returns true if the item is a BasicPaymentProduct
 */
export function isBasicPaymentProduct(
  item: BasicPaymentItem,
): item is BasicPaymentProduct {
  return item.type === 'product';
}
