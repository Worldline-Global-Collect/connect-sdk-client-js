import type { AccountOnFileJSON } from './types';

import { AccountOnFileDisplayHints } from './AccountOnFileDisplayHints';
import { Attribute } from './Attribute';
import { MaskedString } from './MaskedString';
import { MaskingUtil } from './MaskingUtil';

export class AccountOnFile {
  readonly attributes: Attribute[];
  readonly displayHints: AccountOnFileDisplayHints;
  readonly id: number;
  readonly paymentProductId: number;
  private readonly _attributeMap: Map<Attribute['key'], Attribute>;

  constructor(readonly json: AccountOnFileJSON) {
    this._attributeMap = new Map(
      json.attributes.map((attr) => {
        const attribute = new Attribute(attr);
        return [attribute.key, attribute];
      }),
    );
    this.attributes = Array.from(this._attributeMap.values());
    this.displayHints = new AccountOnFileDisplayHints(json.displayHints);
    this.id = json.id;
    this.paymentProductId = json.paymentProductId;
  }

  /**
   * Get attribute by attribute key
   * @param attributeKey - The attribute key
   */
  getAttribute(attributeKey: Attribute['key']): Attribute | undefined {
    return this._attributeMap.get(attributeKey);
  }

  getMaskedValueByAttributeKey(attributeKey: string): MaskedString | undefined {
    const value = this.getAttribute(attributeKey)?.value;
    const wildcardMask =
      this.displayHints.getLabelTemplateElement(attributeKey)?.wildcardMask;

    if (value === undefined || wildcardMask === undefined) return undefined;

    return new MaskingUtil().applyMask(wildcardMask, value);
  }
}
