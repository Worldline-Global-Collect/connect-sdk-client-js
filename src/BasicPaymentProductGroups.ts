import type { PaymentProductGroupsJSON } from './types';

import { AccountOnFile } from './AccountOnFile';
import { BasicPaymentProductGroup } from './BasicPaymentProductGroup';

export class BasicPaymentProductGroups {
  readonly accountsOnFile: AccountOnFile[];
  readonly basicPaymentProductGroups: BasicPaymentProductGroup[];
  private readonly _accountOnFileMap: Map<AccountOnFile['id'], AccountOnFile>;
  private readonly _paymentProductGroupMap: Map<
    BasicPaymentProductGroup['id'],
    BasicPaymentProductGroup
  >;

  constructor(readonly json: PaymentProductGroupsJSON) {
    this._paymentProductGroupMap = new Map(
      json.paymentProductGroups.map((productGroup) => {
        const paymentProductGroup = new BasicPaymentProductGroup(productGroup);
        return [paymentProductGroup.id, paymentProductGroup];
      }),
    );
    this.basicPaymentProductGroups = Array.from(
      this._paymentProductGroupMap.values(),
    );
    this.accountsOnFile = this.basicPaymentProductGroups.flatMap(
      (basicPaymentProductGroup) => basicPaymentProductGroup.accountsOnFile,
    );
    this._accountOnFileMap = new Map(
      this.accountsOnFile.map((accountsOnFile) => [
        accountsOnFile.id,
        accountsOnFile,
      ]),
    );
  }

  /**
   * Get the basic payment product group by given basic payment product group id.
   * @param paymentProductGroupId - The basic payment product group id
   */
  getBasicPaymentProductGroup(
    paymentProductGroupId: BasicPaymentProductGroup['id'],
  ): BasicPaymentProductGroup | undefined {
    return this._paymentProductGroupMap.get(paymentProductGroupId);
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
}
