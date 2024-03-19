import type { BasicPaymentProductGroupJSON } from './types';

import { AccountOnFile } from './AccountOnFile';
import { PaymentProductDisplayHints } from './PaymentProductDisplayHints';

export class BasicPaymentProductGroup {
  readonly id: string;
  readonly acquirerCountry?: string;
  readonly allowsInstallments: boolean;
  readonly displayHints: PaymentProductDisplayHints;
  readonly accountsOnFile: AccountOnFile[];
  readonly type = 'group';
  private readonly _accountOnFileMap: Map<AccountOnFile['id'], AccountOnFile>;

  constructor(readonly json: BasicPaymentProductGroupJSON) {
    this.json.type = 'group';
    this.id = json.id;
    this._accountOnFileMap = new Map(
      (json.accountsOnFile || []).map((aof) => {
        const accountOnFile = new AccountOnFile(aof);
        return [accountOnFile.id, accountOnFile];
      }),
    );
    this.accountsOnFile = Array.from(this._accountOnFileMap.values());

    //this.acquirerCountry = json.acquirerCountry;
    this.allowsInstallments = json.allowsInstallments;
    this.displayHints = new PaymentProductDisplayHints(json.displayHints);
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

  copy(): BasicPaymentProductGroup {
    return new BasicPaymentProductGroup(JSON.parse(JSON.stringify(this.json)));
  }
}
