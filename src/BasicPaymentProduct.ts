import type { BasicPaymentProductJSON } from './types';

import { AccountOnFile } from './AccountOnFile';
import { AuthenticationIndicator } from './AuthenticationIndicator';
import { PaymentProduct302SpecificData } from './PaymentProduct302SpecificData';
import { PaymentProduct320SpecificData } from './PaymentProduct320SpecificData';
import { PaymentProduct863SpecificData } from './PaymentProduct863SpecificData';
import { PaymentProductDisplayHints } from './PaymentProductDisplayHints';

export class BasicPaymentProduct {
  readonly accountsOnFile: AccountOnFile[];
  readonly allowsRecurring: boolean;
  readonly allowsTokenization: boolean;
  readonly autoTokenized: boolean;
  readonly allowsInstallments: boolean;
  readonly authenticationIndicator?: AuthenticationIndicator;
  readonly acquirerCountry?: string;
  readonly canBeIframed?: boolean;
  readonly deviceFingerprintEnabled: boolean;
  readonly displayHints: PaymentProductDisplayHints;
  readonly id: number;
  readonly isJavaScriptRequired?: boolean;
  readonly maxAmount?: number;
  readonly minAmount?: number;
  readonly paymentMethod: string;
  readonly mobileIntegrationLevel: string;
  readonly usesRedirectionTo3rdParty: boolean;
  readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData;
  readonly paymentProduct320SpecificData?: PaymentProduct320SpecificData;
  readonly paymentProduct863SpecificData?: PaymentProduct863SpecificData;
  readonly paymentProductGroup?: string;
  readonly supportsMandates?: boolean;
  readonly type = 'product';
  private readonly _accountOnFileMap: Map<AccountOnFile['id'], AccountOnFile>;

  constructor(readonly json: BasicPaymentProductJSON) {
    this.json.type = 'product';
    this.allowsRecurring = json.allowsRecurring;
    this.allowsTokenization = json.allowsTokenization;
    this.autoTokenized = json.autoTokenized;
    this.allowsInstallments = json.allowsInstallments;
    this.acquirerCountry = json.acquirerCountry;
    this.canBeIframed = json.canBeIframed;
    this.deviceFingerprintEnabled = json.deviceFingerprintEnabled;
    this.displayHints = new PaymentProductDisplayHints(json.displayHints);
    this.id = json.id;
    this.isJavaScriptRequired = json.isJavaScriptRequired;
    this.maxAmount = json.maxAmount;
    this.minAmount = json.minAmount;
    this.paymentMethod = json.paymentMethod;
    this.mobileIntegrationLevel = json.mobileIntegrationLevel;
    this.usesRedirectionTo3rdParty = json.usesRedirectionTo3rdParty;
    this.paymentProductGroup = json.paymentProductGroup;
    this.supportsMandates = json.supportsMandates;
    this._accountOnFileMap = new Map(
      (json.accountsOnFile || []).map((aof) => {
        const accountOnFile = new AccountOnFile(aof);
        return [accountOnFile.id, accountOnFile];
      }),
    );
    this.accountsOnFile = Array.from(this._accountOnFileMap.values());

    if (json.authenticationIndicator) {
      this.authenticationIndicator = new AuthenticationIndicator(
        json.authenticationIndicator,
      );
    }
    if (json.paymentProduct302SpecificData) {
      this.paymentProduct302SpecificData = new PaymentProduct302SpecificData(
        json.paymentProduct302SpecificData,
      );
    }
    if (json.paymentProduct320SpecificData) {
      this.paymentProduct320SpecificData = new PaymentProduct320SpecificData(
        json.paymentProduct320SpecificData,
      );
    }
    if (json.paymentProduct863SpecificData) {
      this.paymentProduct863SpecificData = new PaymentProduct863SpecificData(
        json.paymentProduct863SpecificData,
      );
    }
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

  copy(): BasicPaymentProduct {
    return new BasicPaymentProduct(JSON.parse(JSON.stringify(this.json)));
  }
}
