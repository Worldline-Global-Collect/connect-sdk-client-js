import type { PaymentProductsJSON } from './types';

import { AccountOnFile } from './AccountOnFile';
import { BasicPaymentProduct } from './BasicPaymentProduct';

export class BasicPaymentProducts {
  readonly accountsOnFile: AccountOnFile[];
  readonly basicPaymentProducts: BasicPaymentProduct[];
  private readonly _accountOnFileMap: Map<AccountOnFile['id'], AccountOnFile>;
  private readonly _basicPaymentProductMap: Map<
    BasicPaymentProduct['id'],
    BasicPaymentProduct
  >;
  private readonly _basicPaymentProductByAccountOnFileMap: Map<
    AccountOnFile['id'],
    BasicPaymentProduct
  >;

  constructor(readonly json: PaymentProductsJSON) {
    this._basicPaymentProductMap = new Map(
      json.paymentProducts.map((product) => {
        const paymentProduct = new BasicPaymentProduct(product);
        return [paymentProduct.id, paymentProduct];
      }),
    );
    this.basicPaymentProducts = Array.from(
      this._basicPaymentProductMap.values(),
    );
    this.accountsOnFile = this.basicPaymentProducts.flatMap(
      (product) => product.accountsOnFile,
    );
    this._accountOnFileMap = new Map(
      this.accountsOnFile.map((aof) => [aof.id, aof]),
    );
    this._basicPaymentProductByAccountOnFileMap = new Map(
      this.basicPaymentProducts.flatMap((basicPaymentProduct) => {
        return basicPaymentProduct.accountsOnFile.map((accountOnFile) => [
          accountOnFile.id,
          basicPaymentProduct,
        ]);
      }),
    );
  }

  /**
   * Get the basic payment product by given account on file id.
   * @param accountOnFileId - The account on file id
   */
  getBasicPaymentProductByAccountOnFile(
    accountOnFileId: AccountOnFile['id'],
  ): BasicPaymentProduct | undefined {
    return this._basicPaymentProductByAccountOnFileMap.get(accountOnFileId);
  }

  /**
   * Get the basic payment product by given basic payment product id.
   * @param basicPaymentProductId - The basic payment product id
   */
  getBasicPaymentProduct(
    basicPaymentProductId: BasicPaymentProduct['id'],
  ): BasicPaymentProduct | undefined {
    return this._basicPaymentProductMap.get(basicPaymentProductId);
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
