import type { PaymentProduct } from './PaymentProduct';
import type { PaymentProductGroup } from './PaymentProductGroup';

export type PaymentItem = PaymentProduct | PaymentProductGroup;

/**
 * Returns true if the item is a PaymentProductGroup
 */
export function isPaymentProductGroup(
  item: PaymentItem,
): item is PaymentProductGroup {
  return item.type === 'group';
}

/**
 * Returns true if the item is a PaymentProduct
 */
export function isPaymentProduct(item: PaymentItem): item is PaymentProduct {
  return item.type === 'product';
}
