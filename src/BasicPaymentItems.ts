import type { BasicPaymentProduct } from './BasicPaymentProduct';
import type { BasicPaymentItem } from './BasicPaymentItem';

import { AccountOnFile } from './AccountOnFile';
import { BasicPaymentProductGroups } from './BasicPaymentProductGroups';
import { BasicPaymentProducts } from './BasicPaymentProducts';

export class BasicPaymentItems {
  readonly accountsOnFile: AccountOnFile[];
  readonly basicPaymentItems: BasicPaymentItem[];
  private readonly _accountOnFileMap: Map<AccountOnFile['id'], AccountOnFile>;
  private readonly _basicPaymentItemMap: Map<
    BasicPaymentItem['id'],
    BasicPaymentItem
  >;

  constructor(
    products: BasicPaymentProducts,
    groups?: BasicPaymentProductGroups | null,
  ) {
    this.basicPaymentItems = this._basicPaymentProductsToBasicPaymentItems(
      products.basicPaymentProducts,
      groups,
    );
    this._basicPaymentItemMap = new Map(
      this.basicPaymentItems.map((basicPaymentItem) => [
        basicPaymentItem.id,
        basicPaymentItem,
      ]),
    );
    this.accountsOnFile = this.basicPaymentItems.flatMap(
      (basicPaymentItem) => basicPaymentItem.accountsOnFile,
    );
    this._accountOnFileMap = new Map(
      this.accountsOnFile.map((aof) => [aof.id, aof]),
    );
  }

  private _basicPaymentProductsToBasicPaymentItems(
    products: BasicPaymentProduct[],
    groups?: BasicPaymentProductGroups | null,
  ): BasicPaymentItem[] {
    if (groups) {
      const _groupReplacements: Set<string> = new Set();

      return products
        .map((product) => {
          const group = groups.basicPaymentProductGroups.find(
            (basicPaymentProductGroup) =>
              basicPaymentProductGroup.id === product.paymentProductGroup,
          );

          // No groups found, add product
          if (!group) return product.copy();

          // Products cannot match with more than one group
          if (_groupReplacements.has(group.id)) return;

          _groupReplacements.add(group.id);
          return group.copy();
        })
        .filter(Boolean) as BasicPaymentItem[];
    }

    return products.map((product) => product.copy());
  }

  /**
   * Get the account on file by given account on file id.
   * @param accountOnFileId - The account on file id
   */
  getAccountOnFile(
    accountOnFileId: AccountOnFile['id'],
  ): AccountOnFile | undefined {
    return this._accountOnFileMap.get(accountOnFileId);
  }

  /**
   * Get the basic payment item by given basic payment item id.
   * @param basicPaymentItemId - The basic payment item id
   */
  getBasicPaymentItem(
    basicPaymentItemId: BasicPaymentItem['id'],
  ): BasicPaymentItem | undefined {
    return this._basicPaymentItemMap.get(basicPaymentItemId);
  }
}
