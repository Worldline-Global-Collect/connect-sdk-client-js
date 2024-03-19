import type { AccountOnFileDisplayHintsJSON } from './types';
import type { Attribute } from './Attribute';

import { LabelTemplateElement } from './LabelTemplateElement';

export class AccountOnFileDisplayHints {
  readonly logo: string;
  readonly labelTemplate: LabelTemplateElement[];
  private readonly _labelTemplateElementMap: Map<
    Attribute['key'],
    LabelTemplateElement
  >;

  constructor(readonly json: AccountOnFileDisplayHintsJSON) {
    this.logo = json.logo;
    this._labelTemplateElementMap = new Map(
      json.labelTemplate.map((element) => {
        const labelTemplateElement = new LabelTemplateElement(element);
        return [labelTemplateElement.attributeKey, labelTemplateElement];
      }),
    );
    this.labelTemplate = Array.from(this._labelTemplateElementMap.values());
  }

  /**
   * Get the label template element by attribute key
   * @param attributeKey - The attribute key
   */
  getLabelTemplateElement(
    attributeKey: Attribute['key'],
  ): LabelTemplateElement | undefined {
    return this._labelTemplateElementMap.get(attributeKey);
  }
}
